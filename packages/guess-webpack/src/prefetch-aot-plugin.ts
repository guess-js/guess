import { readFileSync, writeFile } from 'fs';
import {
  PrefetchAotGraph,
  PrefetchAotNeighbor,
  PrefetchAotPluginConfig,
  FileChunkMap
} from './declarations';

import { join } from 'path';
import chalk from 'chalk';
import {
  buildMap,
  defaultPrefetchConfig,
  getCompilationMapping,
  stripExtension
} from './utils';
import { Logger, LogLevel } from '../../common/logger';
import { AssetObserver, Asset } from './asset-observer';

const template = require('lodash.template');
const { table } = require('table');

const alterChunk = (
  compiler: any,
  chunkName: string,
  original: string,
  toAlter: string,
  toBundle: boolean
): Promise<string> => {
  const promise: Promise<string> = !toBundle
    ? Promise.resolve<string>(toAlter)
    : new Promise<string>((resolve, reject) => {
        const MemoryFileSystem = require('memory-fs');
        const memoryFs = new MemoryFileSystem();

        memoryFs.mkdirpSync('/src');
        memoryFs.writeFileSync('/src/index.js', toAlter, 'utf-8');
        memoryFs.writeFileSync(
          '/src/guess-aot.js',
          readFileSync(join(__dirname, 'guess-aot.js')).toString(),
          'utf-8'
        );

        const inMemoryCompiler = require('webpack')({
          context: '/src/',
          mode: 'production',
          entry: './index.js',
          target: 'node',
          output: {
            filename: './output.js'
          }
        });

        inMemoryCompiler.inputFileSystem = memoryFs;
        inMemoryCompiler.outputFileSystem = memoryFs;
        inMemoryCompiler.resolvers.normal.fileSystem = memoryFs;
        inMemoryCompiler.resolvers.context.fileSystem = memoryFs;

        inMemoryCompiler.run((err: any, stats: any) => {
          if (err) {
            reject();
            throw err;
          }
          resolve(stats.compilation.assets['./output.js'].source() as string);
        });
      });

  return promise.then((output: string) => {
    return new Promise((resolve, reject) => {
      writeFile(
        join(compiler.outputPath, chunkName),
        original + '\n' + output,
        err => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });
  });
};

export class PrefetchAotPlugin {
  private logger = new Logger();
  constructor(private _config: PrefetchAotPluginConfig) {
    if (!_config.data) {
      throw new Error('Page graph not provided');
    }
    if (this._config.debug) {
      this.logger.setLevel(LogLevel.DEBUG);
    }
  }

  execute(
    compiler: any,
    compilation: any,
    assetObserver: AssetObserver,
    callback: any
  ) {
    this.logger.debug('Inside PrefetchAotPlugin');

    let mainName: string | null = null;
    let fileChunk: FileChunkMap = {};

    try {
      const res = getCompilationMapping(
        compilation,
        new Set(this._config.routes.map(r => stripExtension(r.modulePath))),
        this.logger
      );
      mainName = res.mainName;
      fileChunk = res.fileChunk;
    } catch (e) {
      callback();
      this.logger.error(e);
      return;
    }

    this.logger.debug(
      'Mapping between chunk name and entry point',
      JSON.stringify(fileChunk, null, 2)
    );

    if (!mainName) {
      callback();
      throw new Error('Cannot find the main chunk of the application');
    }

    const newConfig: PrefetchAotGraph = {};
    const chunkRoute: { [chunk: string]: string } = {};
    const initialGraph = buildMap(
      this._config.routes.map(r => {
        return {
          ...r,
          modulePath: stripExtension(r.modulePath),
          parentModulePath: r.parentModulePath
            ? stripExtension(r.parentModulePath)
            : null
        };
      }),
      this._config.data,
      this.logger,
      !!this._config.debug
    );

    this.logger.debug(
      'Initial mapping between routes and probability',
      JSON.stringify(initialGraph, null, 2)
    );

    Object.keys(initialGraph).forEach(route => {
      newConfig[route] = [];
      initialGraph[route].forEach(neighbor => {
        const node = fileChunk[neighbor.file];
        if (!node) {
          this.logger.debug('No chunk for file', neighbor.file);
          return;
        }
        chunkRoute[node.file] = neighbor.route;
        const newTransition: PrefetchAotNeighbor = {
          probability: neighbor.probability,
          chunks: [...new Set([node.file, ...node.deps])]
        };
        newConfig[route].push(newTransition);
      });
    });

    this.logger.debug('Built the model', JSON.stringify(newConfig, null, 2));
    this.logger.debug(
      'File to chunk mapping',
      JSON.stringify(fileChunk, null, 2)
    );
    this.logger.debug(
      'Chunk to route mapping is',
      JSON.stringify(chunkRoute, null, 2)
    );

    chunkRoute[mainName] = '/';

    const tableOutput: any[] = [['Prefetcher', 'Target', 'Probability']];
    const generateNeighbors = (
      route: string,
      currentChunk: string,
      c: PrefetchAotNeighbor
    ): false | [number, string] => {
      if (!c.chunks || !c.chunks.length) {
        this.logger.debug('Cannot find chunk name for', c, 'from route', route);
        return false;
      }
      tableOutput.push([currentChunk, c.chunks[0], c.probability]);
      return [
        c.probability,
        `[${parseFloat(c.probability.toFixed(2))},${c.chunks
          .map(chunk => `'${chunk}'`)
          .join(',')}]`
      ];
    };

    let chunksLeft = Object.keys(chunkRoute).length;

    const conf = this._config.prefetchConfig || defaultPrefetchConfig;
    const minProbability = Math.min(
      conf['2g'],
      conf['3g'],
      conf['4g'],
      conf['slow-2g']
    );

    const handleAsset = (asset: Asset) => {
      const chunkName = asset.name;
      const route = chunkRoute[chunkName];
      if (!route) {
        this.logger.debug(
          `Cannot find the route "${route}" for chunk "${chunkName}"`
        );
        asset.callback();
        return;
      }

      const neighbors = (newConfig[route] || [])
        .map(generateNeighbors.bind(null, route, chunkName))
        .filter(Boolean)
        .sort((a, b) => (a === false || b === false ? 0 : b[0] - a[0]))
        .filter(n => n === false ? false : n[0] >= minProbability)
        .map(n => (n === false ? null : n[1]));

      if (newConfig[route]) {
        this.logger.debug('Adding', neighbors);
      } else {
        this.logger.debug('Nothing to prefetch from', route);
      }

      let newCode = newConfig[route]
        ? `__GUESS__.p(${neighbors.join(',')})`
        : '';

      const isMainChunk = mainName === chunkName;

      if (isMainChunk) {
        this.logger.debug('Adding prefetching logic in', mainName);
        const codeTemplate = 'aot.tpl';
        const runtimeTemplate = readFileSync(
          join(__dirname, codeTemplate)
        ).toString();

        const prefetchingLogic = template(runtimeTemplate)({
          THRESHOLDS: JSON.stringify(
            Object.assign(
              {},
              defaultPrefetchConfig,
              this._config.prefetchConfig
            )
          ),
          BASE_PATH: this._config.base
        });
        newCode = prefetchingLogic + ';' + newCode;
        this.logger.debug('Altering the main chunk');
      }

      alterChunk(
        compiler,
        chunkName,
        readFileSync(join(compiler.outputPath, chunkName)).toString(),
        newCode,
        isMainChunk
      ).finally(asset.callback);

      chunksLeft -= 1;
      if (!chunksLeft) {
        this.logger.info(
          chalk.blue(
            '\n\n\n🔮 Guess.js introduced the following prefetching instructions:'
          )
        );
        this.logger.info('\n\n' + table(tableOutput));
      }
    };

    assetObserver.onAsset(handleAsset);
    assetObserver.buffer.forEach(handleAsset);

    callback();
  }
}

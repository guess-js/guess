import { readFileSync } from 'fs';
import {
  PrefetchAotGraph,
  PrefetchAotNeighbor,
  PrefetchAotPluginConfig
} from './declarations';

import { join } from 'path';
import { table } from 'table';
import chalk from 'chalk';
import {
  buildMap,
  defaultPrefetchConfig,
  getCompilationMapping,
  stripExtension
} from './utils';

const template = require('lodash.template');
const ConcatSource = require('webpack-sources').ConcatSource;

const alterChunk = (
  compilation: any,
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

        const compiler = require('webpack')({
          context: '/src/',
          mode: 'production',
          entry: './index.js',
          target: 'node',
          output: {
            filename: './output.js'
          }
        });

        compiler.inputFileSystem = memoryFs;
        compiler.outputFileSystem = memoryFs;
        compiler.resolvers.normal.fileSystem = memoryFs;
        compiler.resolvers.context.fileSystem = memoryFs;

        compiler.run((err: any, stats: any) => {
          if (err) {
            reject();
            throw err;
          }
          resolve(stats.compilation.assets['./output.js'] as string);
        });
      });

  return promise.then((output: string) => {
    compilation.assets[chunkName] = new ConcatSource(original, '\n', output);
    return output;
  });
};

const forEachBlock = (chunk: any, cb: ({ block, chunk }: any) => void) => {
  let blocks: any[] = [];
  if (chunk.groupsIterable) {
    blocks = Array.from(chunk.groupsIterable).reduce(
      (prev: any[], group: any) =>
        prev.concat(
          group.getBlocks().map((block: any) => ({ chunk: group, block }))
        ),
      []
    );
  } else {
    blocks = (chunk.blocks || []).map((block: any) => ({ chunk, block }));
  }
  blocks.forEach(cb);
};

export class PrefetchAotPlugin {
  constructor(private _config: PrefetchAotPluginConfig) {
    if (!_config.data) {
      throw new Error('Page graph not provided');
    }
  }

  execute(compilation: any, callback: any) {
    if (this._config.debug) {
      console.log('Inside PrefetchAotPlugin');
    }

    let mainName: string | null = null;
    let fileChunk: { [key: string]: string } = {};

    try {
      const res = getCompilationMapping(
        compilation,
        new Set(this._config.routes.map(r => stripExtension(r.modulePath))),
        this._config.debug
      );
      mainName = res.mainName;
      fileChunk = res.fileChunk;
    } catch (e) {
      callback();
      console.error(e);
    }

    if (this._config.debug) {
      console.log(
        'Mapping between chunk name and entry point',
        JSON.stringify(fileChunk, null, 2)
      );
    }

    if (!mainName) {
      callback();
      throw new Error('Cannot find the main chunk of the application');
    }

    const newConfig: PrefetchAotGraph = {};
    const routeChunk: { [route: string]: string } = {};
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
      !!this._config.debug
    );
    if (this._config.debug) {
      console.log(
        'Initial mapping between routes and probability',
        JSON.stringify(initialGraph, null, 2)
      );
    }
    Object.keys(initialGraph).forEach(route => {
      newConfig[route] = [];
      initialGraph[route].forEach(neighbor => {
        routeChunk[neighbor.route] = fileChunk[neighbor.file];
        const newTransition: PrefetchAotNeighbor = {
          probability: neighbor.probability,
          chunk: fileChunk[neighbor.file]
        };
        newConfig[route].push(newTransition);
      });
    });

    if (this._config.debug) {
      console.log('Built the model', JSON.stringify(newConfig, null, 2));
      console.log('File to chunk mapping', JSON.stringify(fileChunk, null, 2));
      console.log(
        'Route to chunk mapping is',
        JSON.stringify(routeChunk, null, 2)
      );
    }

    if (this._config.debug) {
      console.log('Adding prefetching logic in', mainName);
    }
    const old = compilation.assets[mainName];

    const codeTemplate = 'aot.tpl';
    const runtimeTemplate = readFileSync(
      join(__dirname, codeTemplate)
    ).toString();

    const runtimeLogic = template(runtimeTemplate)({
      THRESHOLDS: JSON.stringify(
        Object.assign({}, defaultPrefetchConfig, this._config.prefetchConfig)
      )
    });

    if (this._config.debug) {
      console.log('Altering the main chunk');
    }

    const compilationPromises = [
      alterChunk(compilation, mainName, old.source(), runtimeLogic, true)
    ];

    if (this._config.debug) {
      console.log('Main chunk altered');
      console.log('Altering all other chunks to prefetch their neighbours');
    }

    routeChunk['/'] = mainName;

    const tableOutput: any[] = [['Prefetcher', 'Target', 'Probability']];
    const generateNeighbors = (
      route: string,
      currentChunk: string,
      c: PrefetchAotNeighbor
    ) => {
      if (!c.chunk) {
        if (this._config.debug) {
          console.warn('Cannot find chunk name for', c, 'from route', route);
        }
        return false;
      }
      tableOutput.push([currentChunk, c.chunk, c.probability]);
      return `['${join(this._config.basePath, c.chunk)}',${c.probability}]`;
    };

    Object.keys(routeChunk).forEach(route => {
      const chunkName = routeChunk[route];
      const currentChunk = compilation.assets[chunkName];
      if (!currentChunk) {
        callback();
        console.warn(
          `Cannot find the chunk "${chunkName}" for route "${route}"`
        );
        return;
      }
      const neighbors = (newConfig[route] || [])
        .map(generateNeighbors.bind(null, route, chunkName))
        .filter(Boolean);
      if (this._config.debug) {
        if (newConfig[route]) {
          console.log('Adding', neighbors);
        } else {
          console.log('Nothing to prefetch from', route);
        }
      }
      const newCode = newConfig[route]
        ? `__GUESS__.p(${neighbors.join(',')})`
        : '';

      // If this is the main chunk, we want to add prefetching instructions
      // only after the runtime is in the bundle, we don't want to overwrite it.
      if (chunkName === mainName) {
        compilationPromises[0] = compilationPromises[0].then(() =>
          alterChunk(
            compilation,
            chunkName,
            compilation.assets[chunkName].source(),
            newCode,
            false
          )
        );
      } else {
        compilationPromises.push(
          alterChunk(
            compilation,
            chunkName,
            currentChunk.source(),
            newCode,
            false
          )
        );
      }
    });

    console.log(
      chalk.blue(
        '\n\n\n🔮 Guess.js introduced the following prefetching instructions:'
      )
    );
    console.log(table(tableOutput));

    Promise.all(compilationPromises)
      .then(() => {
        if (this._config.debug) {
          console.log('Chunks altered');
        }
        callback();
      })
      .catch(e => {
        if (this._config.debug) {
          console.error(e);
        }
        callback();
        throw e;
      });
  }
}

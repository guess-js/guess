import { readFileSync } from 'fs';
import {
  PrefetchPluginConfig,
  PrefetchGraph,
  PrefetchNeighbor
} from './declarations';
import { compressGraph } from './compress';
import { join } from 'path';
import {
  defaultPrefetchConfig,
  buildMap,
  getCompilationMapping,
  stripExtension
} from './utils';

const template = require('lodash.template');
const ConcatSource = require('webpack-sources').ConcatSource;

export class PrefetchPlugin {
  constructor(private _config: PrefetchPluginConfig) {
    if (!_config.data) {
      throw new Error('Page graph not provided');
    }
  }

  execute(compilation: any, callback: any) {
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

    if (mainName === null) {
      callback();
      throw new Error('Cannot find the main chunk of the application');
    }

    const newConfig: PrefetchGraph = {};
    const initialGraph = buildMap(
      this._config.routes.map(r => {
        return {
          ...r,
          modulePath: stripExtension(r.modulePath),
          parentModulePath: r.parentModulePath ? stripExtension(r.parentModulePath) : null
        };
      }),
      this._config.data,
      !!this._config.debug
    );
    Object.keys(initialGraph).forEach(c => {
      newConfig[c] = [];
      initialGraph[c].forEach(p => {
        const newTransition: PrefetchNeighbor = {
          probability: p.probability,
          route: p.route,
          chunk: fileChunk[p.file]
        };
        newConfig[c].push(newTransition);
      });
    });

    const old = compilation.assets[mainName];
    const { graph, graphMap } = compressGraph(newConfig, 3);

    const codeTemplate = 'runtime.tpl';
    const runtimeTemplate = readFileSync(
      join(__dirname, codeTemplate)
    ).toString();

    const runtimeLogic = template(runtimeTemplate)({
      BASE_PATH: this._config.basePath,
      GRAPH: JSON.stringify(graph),
      GRAPH_MAP: JSON.stringify(graphMap),
      THRESHOLDS: JSON.stringify(
        Object.assign({}, defaultPrefetchConfig, this._config.prefetchConfig)
      )
    });

    const MemoryFileSystem = require('memory-fs');
    const memoryFs = new MemoryFileSystem();

    memoryFs.mkdirpSync('/src');
    memoryFs.writeFileSync('/src/index.js', runtimeLogic, 'utf-8');
    memoryFs.writeFileSync(
      '/src/guess.js',
      readFileSync(join(__dirname, 'guess.js')).toString(),
      'utf-8'
    );
    memoryFs.writeFileSync(
      '/src/runtime.js',
      readFileSync(join(__dirname, 'runtime.js')).toString(),
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
        callback();
        throw err;
      }

      compilation.assets[mainName!] = new ConcatSource(
        stats.compilation.assets['./output.js'],
        '\n',
        old.source()
      );
      callback();
    });
  }
}

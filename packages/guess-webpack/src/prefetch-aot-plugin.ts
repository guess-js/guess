import { readFileSync } from 'fs';
import {
  PrefetchAotGraph,
  PrefetchAotNeighbor,
  PrefetchAotPluginConfig
} from './declarations';

import { join } from 'path';
import { isInitial, buildMap, defaultPrefetchConfig } from './utils';

const template = require('lodash.template');
const ConcatSource = require('webpack-sources').ConcatSource;

const alterChunk = (
  compilation: any,
  chunkName: string,
  original: string,
  toAlter: string
) => {
  return new Promise((resolve, reject) => {
    const MemoryFileSystem = require('memory-fs');
    const memoryFs = new MemoryFileSystem();

    memoryFs.mkdirpSync('/src');
    memoryFs.writeFileSync('/src/index.js', toAlter, 'utf-8');
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
        reject();
        throw err;
      }

      const code = stats.compilation.assets['./output.js'].source();
      compilation.assets[chunkName] = new ConcatSource(code, '\n;', original);
      resolve();
    });
  });
};

const forEachBlock = (chunk: any, cb: ({ block, chunk }: any) => void) => {
  let blocks: any[] = [];
  if (chunk.groupsIterable) {
    blocks = Array.from(chunk.groupsIterable).reduce(
      (prev: any[], group: any) =>
        prev.concat(
          blocks.concat(
            group.getBlocks().map((block: any) => ({ chunk: group, block }))
          )
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
    const fileChunk: { [path: string]: string } = {};

    let main: any = null;
    compilation.chunks.forEach((currentChunk: any) => {
      if (isInitial(currentChunk)) {
        main = currentChunk;
      }
      forEachBlock(currentChunk, ({ block, chunk }: any) => {
        let name = (chunk.files || [])
          .filter((f: string) => f.endsWith('.js'))
          .pop();
        if (!name && chunk.chunks && chunk.chunks[0]) {
          name = chunk.chunks[0].files[0];
        }
        fileChunk[block.dependencies[0].module.userRequest] = name;
      });
    });

    if (this._config.debug) {
      console.log('Mapping between chunk name and entry point is ready', JSON.stringify(fileChunk, null, 2));
    }

    if (!main) {
      callback();
      throw new Error('Cannot find the main chunk of the application');
    }

    const newConfig: PrefetchAotGraph = {};
    const routeChunk: { [route: string]: string } = {};
    const initialGraph = buildMap(this._config.routes, this._config.data);
    Object.keys(initialGraph).forEach(route => {
      newConfig[route] = [];
      initialGraph[route].forEach(neighbor => {
        routeChunk[neighbor.route] = fileChunk[routeChunk[neighbor.file]];
        const newTransition: PrefetchAotNeighbor = {
          probability: neighbor.probability,
          chunk: fileChunk[neighbor.file]
        };
        newConfig[route].push(newTransition);
      });
    });

    if (this._config.debug) {
      console.log('Built the model', JSON.stringify(newConfig, null, 2));
    }

    const mainName = main.files.filter((f: string) => f.endsWith('.js')).pop();
    const old = compilation.assets[mainName];

    const codeTemplate = 'guess.tpl';
    const runtimeTemplate = readFileSync(
      join(__dirname, codeTemplate)
    ).toString();

    const runtimeLogic = template(runtimeTemplate)({
      THRESHOLDS: JSON.stringify(
        Object.assign({}, defaultPrefetchConfig, this._config.prefetchConfig)
      )
    });

    const compilationPromises = [
      alterChunk(compilation, mainName, old.source(), runtimeLogic)
    ];
    Object.keys(routeChunk).forEach(route => {
      const chunk = routeChunk[route];
      const currentChunk = compilation.assets[chunk];
      if (!currentChunk) {
        callback();
        throw new Error(`Cannot find the chunk ${chunk}`);
      }
      const newCode = `__GUESS__.p([${newConfig[route]
        .map(c => `'${join(this._config.basePath, c.chunk)}', ${c.probability}`)
        .join(',')}])`;
      compilationPromises.push(
        alterChunk(compilation, chunk, currentChunk.source(), newCode)
      );
    });
    Promise.all(compilationPromises)
      .then(callback)
      .catch(e => {
        callback();
        throw e;
      });
  }
}

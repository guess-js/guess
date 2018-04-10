import { readFileSync } from 'fs';
import {
  CompressedPrefetchGraph,
  CompressedGraphMap,
  PrefetchConfig,
  PrefetchPluginConfig,
  PrefetchGraph,
  PrefetchNeighbor,
  BundleEntryGraph
} from './declarations';
import { Graph, RoutingModule } from '../common/interfaces';
import { compressGraph } from './compress';

const template = require('lodash.template');
const runtimeTemplate = require('./runtime.tpl');
const ConcatSource = require('webpack-sources').ConcatSource;

export class PrefetchPlugin {
  private _debug: boolean;

  constructor(private _config: PrefetchPluginConfig) {
    this._debug = !!_config.debug;
    if (!_config.data) {
      throw new Error('Page graph not provided');
    }
  }

  apply(compilation: any) {
    const fileChunk: { [path: string]: string } = {};

    let main: any = null;
    compilation.chunks.forEach((chunk: any) => {
      if (chunk.name === 'main') {
        main = chunk;
      }
      if (chunk.blocks && chunk.blocks.length > 0) {
        for (const block of chunk.blocks) {
          const name = chunk.files.filter((f: string) => f.endsWith('.js')).pop();
          fileChunk[block.dependencies[0].module.userRequest] = name;
        }
      }
    });

    if (!main) {
      throw new Error('Cannot find the main chunk in the runtime ML plugn');
    }

    const newConfig: PrefetchGraph = {};
    const initialGraph = buildMap(this._config.routes, this._config.data);
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

    const mainName = main.files.filter((f: string) => f.endsWith('.js')).pop();
    const old = compilation.assets[mainName];
    const { graph, graphMap } = compressGraph(newConfig, 3);
    const prefetchLogic = template(runtimeTemplate)({
      BASE_PATH: this._config.basePath || '/',
      GRAPH: JSON.stringify(graph),
      GRAPH_MAP: JSON.stringify(graphMap),
      CODE: readFileSync(__dirname + '/runtime-code.js').toString(),
      THRESHOLDS: JSON.stringify(Object.assign({}, defaultPrefetchConfig, this._config.prefetchConfig))
    });
    compilation.assets[mainName] = new ConcatSource(prefetchLogic, '\n', old.source());
  }
}

const defaultPrefetchConfig: PrefetchConfig = {
  '4g': 0.15,
  '3g': 0.3,
  '2g': 0.45,
  'slow-2g': 0.6
};

const buildMap = (routes: RoutingModule[], graph: Graph): BundleEntryGraph => {
  const result: BundleEntryGraph = {};
  const routeFile = {} as { [key: string]: string };
  routes.forEach(r => {
    routeFile[r.path] = r.modulePath;
  });
  Object.keys(graph).forEach(k => {
    result[k] = [];

    const sum = Object.keys(graph[k]).reduce((a, n) => a + graph[k][n], 0);
    Object.keys(graph[k]).forEach(n => {
      result[k].push({
        route: n,
        probability: graph[k][n] / sum,
        file: routeFile[n]
      });
    });
    result[k] = result[k].sort((a, b) => b.probability - a.probability);
  });
  return result;
};

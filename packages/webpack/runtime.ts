import { Graph, RoutingModule } from '../common/interfaces';

const template = require('lodash.template');
const runtimeTemplate = require('./runtime.tpl');
const ConcatSource = require('webpack-sources').ConcatSource;

export interface PrefetchConfig {
  '4g': number;
  '3g': number;
  '2g': number;
  'slow-2g': number;
}

export interface RuntimePrefetchConfig {
  debug?: boolean;
  data: Graph;
  basePath?: string;
  prefetchConfig?: PrefetchConfig;
  routes: RoutingModule[];
}

interface BundleEntryNeighbor {
  route: string;
  probability: number;
  file: string;
}

interface BundleEntryGraph {
  [node: string]: BundleEntryNeighbor[];
}

interface PrefetchNeighbor {
  route: string;
  probability: number;
  chunk: string;
}

interface PrefetchGraph {
  [node: string]: PrefetchNeighbor[];
}

interface CompressedPrefetchGraph {
  [node: number]: number[][];
}

interface PrefetchGraphMap {
  chunks: { [chunkId: number]: string };
  routes: { [routeId: number]: string };
}

const compressGraph = (input: PrefetchGraph, precision: number) => {
  let currentChunk = 0;
  let currentRoute = 0;
  const chunks: { [chunkId: number]: string } = {};
  const routes: { [routeId: number]: string } = {};
  const chunkToID: { [chunk: string]: number } = {};
  const routeToID: { [route: string]: number } = {};
  const graphMap: PrefetchGraphMap = { chunks, routes };
  const graph: CompressedPrefetchGraph = [];
  Object.keys(input).forEach(route => {
    if (routeToID[route] === undefined) {
      routes[currentRoute] = route;
      routeToID[route] = currentRoute++;
    }
    graph[routeToID[route]] = [];
    input[route].forEach(n => {
      if (routeToID[n.route] === undefined) {
        routes[currentRoute] = n.route;
        routeToID[n.route] = currentRoute++;
      }
      if (chunkToID[n.chunk] === undefined) {
        chunks[currentChunk] = n.chunk;
        chunkToID[n.chunk] = currentChunk++;
      }
      graph[routeToID[route]].push([
        parseFloat(n.probability.toFixed(precision)),
        routeToID[n.route],
        chunkToID[n.chunk]
      ]);
    });
  });
  return { graph, graphMap };
};

export class PrefetchChunksPlugin {
  private _debug: boolean;

  constructor(private _config: RuntimePrefetchConfig) {
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

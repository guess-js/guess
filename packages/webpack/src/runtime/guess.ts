import { CompressedPrefetchGraph, CompressedGraphMap, PrefetchConfig } from '../declarations';

type GuessFn = (params?: Partial<GuessFnParams>) => Predictions;

interface GuessFnParams {
  path: string;
  thresholds: ConnectionEffectiveTypeThresholds;
  connection: ConnectionEffectiveType;
}

type Probability = number;
type ConnectionEffectiveType = '4g' | '3g' | '2g' | 'slow-2g';

interface ConnectionEffectiveTypeThresholds {
  '4g': Probability;
  '3g': Probability;
  '2g': Probability;
  'slow-2g': Probability;
}

interface Predictions {
  [route: string]: Probability;
}

export interface NavigationProbabilities {
  [key: string]: number;
}

class GraphNode {
  constructor(private _node: number[], private _map: CompressedGraphMap) {}

  get probability() {
    return this._node[0];
  }

  get route() {
    return this._map.routes[this._node[1]];
  }

  get chunk() {
    return this._map.chunks[this._node[2]];
  }
}

class Graph {
  constructor(private _graph: CompressedPrefetchGraph, private _map: CompressedGraphMap) {}

  findMatch(route: string): GraphNode[] {
    const result = this._graph.filter((_, i) => matchRoute(this._map.routes[i], route)).pop();
    if (!result) {
      return [];
    }
    return result.map(n => new GraphNode(n, this._map));
  }
}

const matchRoute = (route: string, declaration: string) => {
  const routeParts = route.split('/');
  const declarationParts = declaration.split('/');
  if (routeParts.length > 0 && routeParts[routeParts.length - 1] === '') {
    routeParts.pop();
  }

  if (declarationParts.length > 0 && declarationParts[declarationParts.length - 1] === '') {
    declarationParts.pop();
  }

  if (routeParts.length !== declarationParts.length) {
    return false;
  } else {
    return declarationParts.reduce((a, p, i) => {
      if (p.startsWith(':')) {
        return a;
      }
      return a && p === routeParts[i];
    }, true);
  }
};

const polyfillConnection = {
  effectiveType: '3g'
};

const guessNavigation = (graph: Graph, params: GuessFnParams): NavigationProbabilities => {
  const matches = graph.findMatch(params.path);
  return matches.reduce(
    (p: NavigationProbabilities, n) => {
      if (n.probability >= params.thresholds[params.connection]) {
        p[n.route] = n.probability;
      }
      return p;
    },
    {} as NavigationProbabilities
  );
};

export let guess: GuessFn = (params?: Partial<GuessFnParams>): NavigationProbabilities => {
  throw new Error('Guess is not initialized');
};

const getEffectiveType = (global: any): ConnectionEffectiveType => {
  if (!global.navigator || !global.navigator || !global.navigator.connection) {
    return '3g';
  }
  return global.navigator.connection.effectiveType || '3g';
};

export const initialize = (
  global: any,
  compressed: CompressedPrefetchGraph,
  map: CompressedGraphMap,
  thresholds: PrefetchConfig
) => {
  const graph = new Graph(compressed, map);
  global.__GUESS__ = global.__GUESS__ || {};
  global.__GUESS__.guess = guess = (params?: Partial<GuessFnParams>) => {
    params = params || {};
    if (!params.path) {
      params.path = (global.location || { pathname: '' }).pathname;
    }
    if (!params.connection) {
      params.connection = getEffectiveType(global);
    }
    if (!params.thresholds) {
      params.thresholds = thresholds;
    }
    return guessNavigation(graph, params as GuessFnParams);
  };
};

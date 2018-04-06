import { CompressedPrefetchGraph, CompressedGraphMap, PrefetchConfig } from './declarations';

export class GraphNode {
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

export class Graph {
  constructor(private _graph: CompressedPrefetchGraph, private _map: CompressedGraphMap) {}

  findMatch(route: string) {
    const result = this._graph.filter((_, i) => matchRoute(this._map.routes[i], route)).pop();
    if (!result) {
      return null;
    }
    return result.map(n => new GraphNode(n, this._map));
  }
}

export const support = (feature: string) => {
  const fakeLink = document.createElement('link') as any;
  try {
    if (fakeLink.relList && typeof fakeLink.relList.supports === 'function') {
      return fakeLink.relList.supports(feature);
    }
  } catch (err) {
    return false;
  }
};

const linkPrefetchStrategy = (url: string) => {
  const link = document.createElement('link');
  link.setAttribute('rel', 'prefetch');
  link.setAttribute('href', url);
  const parentElement = document.getElementsByTagName('head')[0] || document.getElementsByName('script')[0].parentNode;
  parentElement.appendChild(link);
};

const importPrefetchStrategy = (url: string) => import(url);

const supportedPrefetchStrategy = support('prefetch') ? linkPrefetchStrategy : importPrefetchStrategy;

const preFetched: { [key: string]: boolean } = {};

export const prefetch = (basePath: string, url: string) => {
  url = basePath + url;
  if (preFetched[url]) {
    return;
  }
  console.log('Pre-fetching', url);
  preFetched[url] = true;
  supportedPrefetchStrategy(url);
};

export const matchRoute = (route: string, declaration: string) => {
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
export const handleNavigationChange = (graph: Graph, basePath: string, thresholds: PrefetchConfig, route: string) => {
  const nodes = graph.findMatch(route);
  if (!nodes) {
    return;
  }
  const c = (navigator as any).connection || polyfillConnection;
  const threshold = (thresholds as any)[c.effectiveType];
  for (const node of nodes) {
    if (node.probability < threshold || preFetched[node.chunk]) {
      continue;
    }
    if (node.chunk) {
      prefetch(basePath, node.chunk);
    }
  }
};

export const initialize = (
  history: History,
  compressed: CompressedPrefetchGraph,
  map: CompressedGraphMap,
  basePath: string,
  thresholds: PrefetchConfig
) => {
  const graph = new Graph(compressed, map);

  window.addEventListener('popstate', e => handleNavigationChange(graph, basePath, thresholds, location.pathname));

  const pushState = history.pushState;
  history.pushState = function(state) {
    if (typeof (history as any).onpushstate == 'function') {
      (history as any).onpushstate({ state: state });
    }
    handleNavigationChange(graph, basePath, thresholds, arguments[2]);
    return pushState.apply(history, arguments);
  };
};

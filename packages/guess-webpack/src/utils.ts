import { PrefetchConfig, BundleEntryGraph } from './declarations';
import { Graph, RoutingModule } from '../../common/interfaces';

export const defaultPrefetchConfig: PrefetchConfig = {
  '4g': 0.15,
  '3g': 0.3,
  '2g': 0.45,
  'slow-2g': 0.6
};

export const buildMap = (routes: RoutingModule[], graph: Graph): BundleEntryGraph => {
  const result: BundleEntryGraph = {};
  const routeFile = {} as { [key: string]: string };
  routes.forEach(r => {
    routeFile[r.path] = r.modulePath;
  });
  Object.keys(graph).forEach(route => {
    result[route] = [];

    const sum = Object.keys(graph[route]).reduce(
      (a, n) => a + graph[route][n],
      0
    );
    Object.keys(graph[route]).forEach(n => {
      result[route].push({
        route: n,
        probability: graph[route][n] / sum,
        file: routeFile[n]
      });
    });
    result[route] = result[route].sort((a, b) => b.probability - a.probability);
  });
  return result;
};

// webpack 4 & 3 compatible.
export const isInitial = (chunk: any) => {
  if (chunk.canBeInitial) {
    return chunk.canBeInitial();
  }
  return /^main(\.js)?$/.test(chunk.name);
};

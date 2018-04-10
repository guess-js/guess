import { CompressedPrefetchGraph, CompressedGraphMap, PrefetchGraph } from './declarations';

export const compressGraph = (input: PrefetchGraph, precision: number) => {
  let currentChunk = 0;
  let currentRoute = 0;
  const chunks: string[] = [];
  const routes: string[] = [];
  const chunkToID: { [chunk: string]: number } = {};
  const routeToID: { [route: string]: number } = {};
  const graphMap: CompressedGraphMap = { chunks, routes };
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

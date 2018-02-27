import { tarjan, NeighborListGraph } from './graph/tarjan';
import { Graph } from './../store/store';

const connected = (a: string, b: string, graph: Graph) => {
  return (graph[a] && graph[a][b] && graph[a][b] > 0) || (graph[b] && graph[b][a] && graph[b][a] > 0);
};

const neighborsList = (graph: Graph, nodes: Set<string>) => {
  const nl: NeighborListGraph = {};
  for (const a of nodes.values()) {
    nl[a] = [];
    for (const b of nodes.values()) {
      if (a === b) {
        continue;
      }
      if (connected(a, b, graph)) {
        nl[a].push(b);
      }
    }
  }
  return nl;
};

const trimGraph = (graph: Graph) => {
  let minEdge = Infinity;
  Object.keys(graph).forEach(k => {
    Object.keys(graph[k]).forEach(n => {
      if (graph[k][n] < minEdge && graph[k][n] > 0) {
        minEdge = graph[k][n];
      }
    });
  });

  Object.keys(graph).forEach(k => {
    Object.keys(graph[k]).forEach(n => {
      graph[k][n] = Math.max(graph[k][n] - minEdge, 0);
    });
  });
};

export const clusterize = (graph: Graph, n: number) => {
  if (n <= 0) {
    throw new Error('The number of bundles should be a positive number');
  }

  const nodes = new Set<string>();
  Object.keys(graph).forEach(k => {
    nodes.add(k);
    Object.keys(graph[k]).forEach(n => {
      nodes.add(n);
    });
  });

  if (n > nodes.size) {
    throw new Error('The number of bundles should be less than the number of routes');
  }

  const result: string[] = [];
  if (n === nodes.size) {
    for (const r of nodes.values()) {
      result.push(r);
    }
    return result;
  }

  while (true) {
    const nl = neighborsList(graph, nodes);
    const cc = tarjan(nl);
    if (cc.length >= n) {
      return cc;
    }
    trimGraph(graph);
  }
};

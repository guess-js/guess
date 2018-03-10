import { NeighborListGraph } from './tarjan';
import { Graph } from './../../store/store';

const connected = (a: string, b: string, graph: Graph) => {
  return (graph[a] && graph[a][b] && graph[a][b] > 0) || (graph[b] && graph[b][a] && graph[b][a] > 0);
};

export const neighborsList = (graph: Graph, nodes: Set<string>): NeighborListGraph => {
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

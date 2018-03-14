import { NeighborListGraph } from './tarjan';

export const topologicalSort = (function() {
  function topologicalSortHelper(
    node: string,
    visited: { [key: string]: boolean },
    temp: { [key: string]: boolean },
    graph: NeighborListGraph,
    result: string[]
  ) {
    temp[node] = true;
    const neighbors = graph[node];
    for (let i = 0; i < neighbors.length; i += 1) {
      const n = neighbors[i];
      if (temp[n]) {
        throw new Error('The graph is not a DAG');
      }
      if (!visited[n]) {
        topologicalSortHelper(n, visited, temp, graph, result);
      }
    }
    temp[node] = false;
    visited[node] = true;
    result.push(node);
  }

  return (graph: NeighborListGraph) => {
    const result: string[] = [];
    const visited: { [key: string]: boolean } = {};
    const temp: { [key: string]: boolean } = {};
    for (const node in graph) {
      if (!visited[node] && !temp[node]) {
        topologicalSortHelper(node, visited, temp, graph, result);
      }
    }
    return result.reverse();
  };
})();

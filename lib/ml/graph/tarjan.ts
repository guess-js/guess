export interface NeighborListGraph {
  [key: string]: string[];
}

export const tarjan = (graph: NeighborListGraph) => {
  graph = graph || {};
  const indexes: { [key: string]: number } = {};
  const lowIndexes: { [key: string]: number } = {};
  const onStack: { [key: string]: boolean } = {};
  const result: string[][] = [];
  const stack: string[] = [];
  let index = 1;

  const connectedComponent = function(node: string) {
    stack.push(node);
    onStack[node] = true;
    indexes[node] = index;
    lowIndexes[node] = index;
    index += 1;
    graph[node].forEach(function(n) {
      if (indexes[n] === undefined) {
        connectedComponent(n);
        lowIndexes[node] = Math.min(lowIndexes[n], lowIndexes[node]);
      } else if (onStack[n]) {
        lowIndexes[node] = Math.min(lowIndexes[node], indexes[n]);
      }
    });
    // This is a "root" node
    const cc: string[] = [];
    if (indexes[node] === lowIndexes[node]) {
      let current;
      do {
        current = stack.pop();
        onStack[current] = false;
        cc.push(current);
      } while (stack.length > 0 && node !== current);
      result.push(cc);
    }
  };

  Object.keys(graph).forEach(function(n) {
    if (!indexes[n]) {
      connectedComponent(n);
    }
  });

  return result;
};

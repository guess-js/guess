import { NeighborListGraph } from '../tarjan';
import { topologicalSort } from '../topological-sort';

describe.only('topological sort', () => {
  it('should work', () => {
    const graph: NeighborListGraph = {
      foo: ['bar'],
      bar: ['baz'],
      baz: []
    };
    const res = topologicalSort(graph);
    expect(res).toEqual(['foo', 'bar', 'baz']);
  });
});

import { compressGraph } from '../src/compress';
import { PrefetchGraph, CompressedGraphMap, CompressedPrefetchGraph } from '../src/declarations';

const sample: PrefetchGraph = {
  a: [
    {
      probability: 0.9,
      route: 'b',
      chunk: 'b.js'
    },
    {
      probability: 0.1,
      route: 'c',
      chunk: 'c.js'
    }
  ],
  b: [
    {
      probability: 1,
      route: 'a',
      chunk: 'a.js'
    }
  ]
};

const fixtureMap: CompressedGraphMap = {
  chunks: ['b.js', 'c.js', 'a.js'],
  routes: ['a', 'b', 'c']
};

const fixtureGraph: CompressedPrefetchGraph = [[[0.9, 1, 0], [0.1, 2, 1]], [[1, 0, 2]]];

describe('compressGraph', () => {
  it('should compress a graph', () => {
    const { graph, graphMap } = compressGraph(sample, 1);
    expect(graphMap).toEqual(fixtureMap);
    expect(graph).toEqual(fixtureGraph);
  });
});

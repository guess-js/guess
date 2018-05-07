import { PrefetchGraph } from '../src/declarations';
import { compressGraph } from '../src/compress';
import { initialize, guess } from '../src/runtime';

const sample: PrefetchGraph = {
  a: [
    {
      probability: 0.9,
      route: 'b',
      chunk: 'b.js'
    },
    {
      probability: 0.1,
      route: 'c/:id',
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
const { graph, graphMap } = compressGraph(sample, 1);
const config = {
  '4g': 0.15,
  '3g': 0.3,
  '2g': 0.45,
  'slow-2g': 0.6
};

describe('runtime', () => {
  it('should guess links', () => {
    initialize(window.history, window, graph, graphMap, '', config, true);
    expect(guess('a', ['b', 'c/1', 'c/2'])).toEqual({ b: 0.9, 'c/1': 0.1, 'c/2': 0.1 });
  });

  it('should work with no matches', () => {
    initialize(window.history, window, graph, graphMap, '', config, true);
    expect(guess('a', ['d', 'g/1', 'x/2'])).toEqual({});
  });

  it('should work with partial matches', () => {
    initialize(window.history, window, graph, graphMap, '', config, true);
    expect(guess('a', ['c/1', 'c/2'])).toEqual({ 'c/1': 0.1, 'c/2': 0.1 });
  });
});

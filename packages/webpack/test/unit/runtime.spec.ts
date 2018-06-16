import { PrefetchGraph } from '../../src/declarations';
import { compressGraph } from '../../src/compress';
import { initialize, guess } from '../../src/runtime/guess';

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
    initialize(window, graph, graphMap, config);
    expect(
      guess({
        path: 'a',
        connection: '4g',
        thresholds: {
          '4g': 0.01,
          '3g': 0.3,
          '2g': 0.45,
          'slow-2g': 0.6
        }
      })
    ).toEqual({ b: { probability: 0.9, chunk: 'b.js' }, 'c/:id': { probability: 0.1, chunk: 'c.js' } });
  });

  it('should work with no matches', () => {
    initialize(window, graph, graphMap, config);
    expect(
      guess({
        path: 'a',
        connection: 'slow-2g',
        thresholds: {
          '4g': 0.01,
          '3g': 0.3,
          '2g': 0.45,
          'slow-2g': 0.95
        }
      })
    ).toEqual({});
  });

  it('should work with partial matches', () => {
    initialize(window, graph, graphMap, config);
    expect(guess({ path: 'a' })).toEqual({ b: { probability: 0.9, chunk: 'b.js' } });
  });
});

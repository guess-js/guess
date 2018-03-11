import { clusterize } from '..';
import { Graph, Module } from '../../common/interfaces';

const g11: Graph = {
  'foo.js': {
    'bar.js': 0.9,
    'baz.js': 0.1
  },
  'bar.js': {
    'baz.js': 0.1,
    'foo.js': 0.9
  },
  'baz.js': {
    'bar.js': 1
  }
};

const g12: Graph = {
  'foo.js': {
    'bar.js': 9,
    'baz.js': 1
  },
  'bar.js': {
    'baz.js': 1,
    'foo.js': 9
  },
  'baz.js': {
    'bar.js': 1
  }
};

const m1: Module[] = [
  {
    modulePath: 'foo.js',
    parentModulePath: null
  },
  {
    modulePath: 'bar.js',
    parentModulePath: 'foo.js'
  },
  {
    modulePath: 'baz.js',
    parentModulePath: 'foo.js'
  }
];

const g21: Graph = {
  'foo.js': {
    'bar.js': 9,
    'baz.js': 1
  },
  'bar.js': {
    'baz.js': 1,
    'foo.js': 9
  },
  'baz.js': {
    'qux.js': 10,
    'bar.js': 7
  },
  'qux.js': {
    'bar.js': 8,
    'foo.js': 7
  }
};

const m2: Module[] = [
  {
    modulePath: 'foo.js',
    parentModulePath: null
  },
  {
    modulePath: 'bar.js',
    parentModulePath: 'foo.js'
  },
  {
    modulePath: 'baz.js',
    parentModulePath: 'bar.js'
  },
  {
    modulePath: 'qux.js',
    parentModulePath: 'baz.js'
  }
];

describe('clusterize', () => {
  it('should work with 1 cluster', () => {
    const res = clusterize(g11, m1, 1);
    expect(res.length).toBe(1);
    expect(res[0].length).toBe(3);
  });

  it('should work with n cluster for n bundles', () => {
    const res = clusterize(g11, m1, 3);
    expect(res.length).toBe(3);
    expect(res[0].length).toBe(1);
    expect(res[1].length).toBe(1);
    expect(res[2].length).toBe(1);
  });

  describe('arbitrary cluster number', () => {
    it('should combine siblings', () => {
      const res = clusterize(g11, m1, 2);
      expect(res.length).toBe(2);
      expect(res[1]).toContain('bar.js');
      expect(res[1]).toContain('baz.js');
    });

    it('should combine parent and child', () => {
      const res = clusterize(g12, m1, 2);
      expect(res.length).toBe(2);
      expect(res[0]).toContain('foo.js');
      expect(res[0]).toContain('bar.js');
    });

    it('should work with multi-level structure', () => {
      const res = clusterize(g21, m2, 2);
      expect(res.length).toBe(2);
      expect(res[0].length).toBe(2);
      expect(res[0]).toContain('foo.js');
      expect(res[0]).toContain('bar.js');

      expect(res[1].length).toBe(2);
      expect(res[1]).toContain('baz.js');
      expect(res[1]).toContain('qux.js');
    });
  });
});

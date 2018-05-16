import { matchRoute, normalize } from '../src/normalize';

const GAData = {
  rows: [
    {
      dimensions: ['/a', '/b'],
      metrics: [
        {
          values: [1]
        }
      ]
    },
    {
      dimensions: ['/a/4', '/c'],
      metrics: [
        {
          values: [1]
        }
      ]
    },
    {
      dimensions: ['/a/3', '/c'],
      metrics: [
        {
          values: [1]
        }
      ]
    },
    {
      dimensions: ['/a', '/a/3'],
      metrics: [
        {
          values: [1]
        }
      ]
    }
  ]
};

describe('matchRoute', () => {
  it('should work simple routes', () => {
    expect(matchRoute('/', '/')).toBeTruthy();
    expect(matchRoute('/foo', '/foo')).toBeTruthy();
    expect(matchRoute('/bar/baz', '/bar/baz')).toBeTruthy();
  });

  it('should work with parameters', () => {
    expect(matchRoute('/bar', '/:random')).toBeTruthy();
    expect(matchRoute('/foo/1', '/foo/:id')).toBeTruthy();
  });

  it('should fail with trailing slash', () => {
    expect(matchRoute('/foo', '/foo/')).toBeFalsy();
  });
});

describe('normalize', () => {
  it('should work without a trailing slash', () => {
    const normalized = normalize(GAData, a => a, ['/a/', '/b', '/a/:id', 'c']);
    expect(normalized).toEqual([
      { from: '/a', to: '/b', weight: 1 },
      { from: '/a/:id', to: '/c', weight: 1 },
      { from: '/a/:id', to: '/c', weight: 1 },
      { from: '/a', to: '/a/:id', weight: 1 }
    ]);
  });
});

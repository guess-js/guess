import { matchRoute } from '../src/normalize';

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
});

import { parsePreactJSXRoutes } from '../src/preact';

const fixtureRoutes = new Set<string>(['/', '/info', '/home', '/profile/', '/profile/:user', '/about']);

describe('Preact JavaScript parser', () => {
  it('should parse an app', () => {
    expect(() => parsePreactJSXRoutes('packages/parser/test/fixtures/preact-app/src')).not.toThrow();
  });

  it('should discover all routes', () => {
    const routes = parsePreactJSXRoutes('packages/parser/test/fixtures/preact-app/src');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
    expect(routes.length).toEqual(fixtureRoutes.size);
    expect((routes.filter(r => !r.lazy).shift() as any).path).toEqual('/info');
  });

  it('should discover all lazy loaded routes', () => {
    const routes = parsePreactJSXRoutes('packages/parser/test/fixtures/preact-app/src');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.filter(r => r.lazy).length).toEqual(5);
  });
});

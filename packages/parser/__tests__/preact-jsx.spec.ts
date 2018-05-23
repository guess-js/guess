import { parsePreactJSXRoutes } from '../src/preact';

const fixtureRoutes = new Set<string>(['/', '/home', '/profile/', '/profile/:user']);

describe('Preact JavaScript parser', () => {
  it('should parse an app', () => {
    expect(() => parsePreactJSXRoutes('packages/parser/__tests__/fixtures/preact-app/src')).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parsePreactJSXRoutes('packages/parser/__tests__/fixtures/preact-app/src');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
    expect(routes.length).toEqual(fixtureRoutes.size);
    expect((routes.filter(r => !r.lazy).shift() as any).path).toEqual('/');
  });
});

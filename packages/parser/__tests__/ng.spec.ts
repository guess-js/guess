import { parseRoutes } from '../ng';

const fixtureRoutes = new Set<string>(['/', '/bar', '/foo']);

describe('Angular parser', () => {
  it('should parse an app', () => {
    expect(() => parseRoutes('packages/parser/__tests__/fixtures/angular/src/tsconfig.app.json')).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseRoutes('packages/parser/__tests__/fixtures/angular/src/tsconfig.app.json');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
    expect(routes.length).toEqual(fixtureRoutes.size);
  });
});

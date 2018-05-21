import { parseRoutes } from '../src/angular';

const fixtureRoutes = new Set<string>(['/', '/bar', '/foo', '/foo/index']);

describe('Angular parser', () => {
  it('should parse an app', () => {
    expect(() => parseRoutes('packages/parser/__tests__/fixtures/angular/src/tsconfig.app.json')).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseRoutes('packages/parser/__tests__/fixtures/angular/src/tsconfig.app.json');
    expect(routes).toBeInstanceOf(Array);
    routes.map(r => r.path).forEach(r => expect(fixtureRoutes).toContain(r));
    expect(routes.length).toEqual(fixtureRoutes.size);
  });
});

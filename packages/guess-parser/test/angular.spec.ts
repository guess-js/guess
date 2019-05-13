import { parseRoutes } from '../src/angular';

const fixtureRoutes = new Set<string>(['qux', 'qux/index', 'bar', 'foo', 'foo/index']);

describe('Angular parser', () => {
  it('should parse an app', () => {
    expect(() =>
      parseRoutes('packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json')
    ).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseRoutes('packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json');
    expect(routes).toBeInstanceOf(Array);
    routes.map(r => r.path).forEach(r => expect(fixtureRoutes).toContain(r));
    expect(routes.length).toEqual(fixtureRoutes.size);
  });

  it('should produce routes with proper paths', () => {
    const routes = parseRoutes('packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json');
    const route = routes.find(r => r.path === 'qux');
    expect(route.modulePath.endsWith('foo.module.ts')).toBeTruthy();
    expect(route.parentModulePath.endsWith('app.module.ts')).toBeTruthy();
  });
});

import { parseRoutes } from '../src/angular';

const fixtureRoutes = new Set([
  '/foo',
  '/foo/baz',
  '/foo/index',
  '/foo/baz/index',
  '/bar/baz',
  '/qux',
  '/library',
  '/bar-simple',
  '/foo/child1',
  '/foo/foo-parent',
  '/foo/foo-parent/child2',
  '/eager',
  '/eager/lazy',
]);

const nxRoutes = new Set([
  '/login',
  '/home',
  '/customers/list',
  '/customers'
]);

describe('Angular parser', () => {
  it('should parse an app', () => {
    expect(() =>
      parseRoutes(
        'packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json'
      )
    ).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseRoutes(
      'packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json'
    );
    expect(routes instanceof Array).toBeTruthy();
    const allRoutes = new Set(routes.map(r => r.path));
    [...allRoutes].forEach(r => expect(fixtureRoutes).toContain(r));
    expect(allRoutes.size).toEqual(fixtureRoutes.size);
  });

  it('should produce routes with proper paths', () => {
    const routes = parseRoutes(
      'packages/guess-parser/test/fixtures/angular/src/tsconfig.app.json'
    );
    const route = routes.find(r => r.path === '/foo');
    expect(route!.modulePath.endsWith('foo.module.ts')).toBeTruthy();
    expect(route!.lazy).toBeTruthy();
    expect(route!.parentModulePath!.endsWith('app.module.ts')).toBeTruthy();
  });

  it('should work with nx monorepo with path mappings', () => {
    const routes = parseRoutes(
      'packages/guess-parser/test/fixtures/nx/apps/ng-cli-app/tsconfig.app.json'
    ).map(r => r.path);
    [...routes].forEach(r => expect(nxRoutes).toContain(r));
  });
});

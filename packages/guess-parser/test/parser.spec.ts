import { parseRoutes } from '../';
import { RoutingModule } from '../../common/interfaces';

const angularFixtureRoutes = new Set<string>([
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

const reactFixtureRoutes = new Set<string>(['/', '/intro', '/main', '/main/kid', '/main/parent']);

describe('parseRoutes', () => {
  describe('auto detect Angular', () => {
    it('should recognize an Angular app and return the routes', () => {
      let routes: RoutingModule[] = [];
      expect(
        () => (routes = parseRoutes('packages/guess-parser/test/fixtures/angular'))
      ).not.toThrow();
      expect(
        routes.map(r => r.path).reduce((c, route) => c && angularFixtureRoutes.has(route), true)
      ).toBe(true);
      expect(routes.length).toEqual(angularFixtureRoutes.size);
    });
  });

  describe('auto detect React', () => {
    it('should recognize a React app and return the routes', () => {
      let routes: RoutingModule[] = [];
      expect(
        () => (routes = parseRoutes('packages/guess-parser/test/fixtures/react-app'))
      ).not.toThrow();
      expect(
        routes.map(r => r.path).reduce((c, route) => c && reactFixtureRoutes.has(route), true)
      ).toEqual(true);
      expect(routes.length).toEqual(reactFixtureRoutes.size);
    });
  });

  describe('auto detect React TypeScript', () => {
    it('should recognize a React TypeScript app and return the routes', () => {
      let routes: RoutingModule[] = [];
      expect(
        () => (routes = parseRoutes('packages/guess-parser/test/fixtures/react-app-ts'))
      ).not.toThrow();
      expect(
        routes.map(r => r.path).reduce((c, route) => c && reactFixtureRoutes.has(route), true)
      ).toEqual(true);
      expect(routes.length).toEqual(reactFixtureRoutes.size);
    });
  });

  describe('unknown app', () => {
    it('should throw when cannot recognize the app', () => {
      expect(() => parseRoutes('packages/guess-parser/test/fixtures/unknown')).toThrow();
    });
  });
});

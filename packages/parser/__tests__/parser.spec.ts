import { parseRoutes } from '../';
import { RoutingModule } from '../../common/interfaces';

const fixtureRoutes = new Set<string>(['/', '/bar', '/foo']);

describe('parseRoutes', () => {
  describe('auto detect Angular', () => {
    it('should recognize the app and return the routes', () => {
      let routes: RoutingModule[];
      expect(() => (routes = parseRoutes('packages/parser/__tests__/fixtures/angular'))).not.toThrow();
      expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
      expect(routes.length).toEqual(fixtureRoutes.size);
    });
  });

  describe('unknown app', () => {
    it('should throw when cannot recognize the app', () => {
      expect(() => parseRoutes('packages/parser/__tests__/fixtures/unknown')).toThrow();
    });
  });
});

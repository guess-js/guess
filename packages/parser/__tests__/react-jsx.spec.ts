import { parseReactJSXRoutes } from '../src/react';

const fixtureRoutes = new Set<string>(['/', '/intro', '/main', '/main/kid', '/main/parent']);

describe('React TypeScript parser', () => {
  it('should parse an app', () => {
    expect(() => parseReactJSXRoutes('packages/parser/__tests__/fixtures/react-app/src')).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseReactJSXRoutes('packages/parser/__tests__/fixtures/react-app/src');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
    expect(routes.length).toEqual(fixtureRoutes.size);
    expect(routes.filter(r => !r.lazy).shift().path).toEqual('/main/kid');
  });
});

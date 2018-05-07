import { parseReactTSXRoutes } from '../src/react';

const fixtureRoutes = new Set<string>(['/', '/intro', '/main', '/main/kid', '/main/parent']);

describe('React TypeScript parser', () => {
  it('should parse an app', () => {
    expect(() => parseReactTSXRoutes('packages/parser/__tests__/fixtures/react-app-ts/tsconfig.json')).not.toThrow();
  });

  it('should produce routes', () => {
    const routes = parseReactTSXRoutes('packages/parser/__tests__/fixtures/react-app-ts/tsconfig.json');
    expect(routes).toBeInstanceOf(Array);
    expect(routes.map(r => r.path).reduce((c, route) => c && fixtureRoutes.has(route), true)).toEqual(true);
    expect(routes.length).toEqual(fixtureRoutes.size);
    expect(routes.filter(r => !r.lazy).shift().path).toEqual('/main/kid');
  });
});

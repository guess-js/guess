import { parseRoutes as ngParseRoutes } from './ng';
import { parseRoutes as reactParseRoutes } from './react';
import { RoutingModule, ProjectType } from '../common/interfaces';
import { AppMetadata } from 'guess-detector';

const unique = (a: RoutingModule[]) => {
  const map: { [path: string]: RoutingModule } = {};
  a.forEach(r => (map[r.path] = r));
  return Object.keys(map).map(k => map[k]);
};

export const parseRoutes = (app: AppMetadata) => {
  let result: RoutingModule[] | undefined = undefined;
  if (app.type === ProjectType.AngularCLI) {
    result = ngParseRoutes('src/tsconfig.json');
  }
  if (app.type === ProjectType.CreateReactAppTypeScript) {
    result = reactParseRoutes('tsconfig.json');
  }
  if (!result) {
    throw new Error('Unknown project type');
  }
  const res = unique(result.filter(r => r.lazy || !r.parentModulePath || r.path === '/'));
  res.filter(r => !r.parentModulePath || r.path === '/').forEach(r => (r.parentModulePath = null));
  return res;
};

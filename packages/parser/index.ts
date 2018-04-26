import { parseRoutes as ngParseRoutes } from './angular-cli';
import { parseRoutes as reactParseRoutes } from './react-ts';
import { RoutingModule, ProjectType } from '../common/interfaces';
import { AppMetadata, detect } from './detector';

export { parseRoutes as ngParseRoutes } from './angular-cli';
export { parseRoutes as reactParseRoutes } from './react-ts';

const unique = (a: RoutingModule[]) => {
  const map: { [path: string]: RoutingModule } = {};
  a.forEach(r => (map[r.path] = r));
  return Object.keys(map).map(k => map[k]);
};

export const parseRoutes = (base: string) => {
  let result: RoutingModule[] | undefined = undefined;
  const app = detect(base);
  if (!app) {
    throw new Error('Cannot detect the application type');
  }
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

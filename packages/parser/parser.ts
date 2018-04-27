import { parseRoutes as ngParseRoutes } from './angular';
import { parseRoutes as reactParseRoutes } from './react-ts';
import { RoutingModule, ProjectType } from '../common/interfaces';
import { detect } from './detector';

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
  if (app.type === ProjectType.AngularCLI && app.details && app.details.tsconfigPath) {
    result = ngParseRoutes(app.details.tsconfigPath);
  }
  if (app.type === ProjectType.CreateReactAppTypeScript && app.details && app.details.tsconfigPath) {
    result = reactParseRoutes(app.details.tsconfigPath);
  }
  if (!result) {
    throw new Error('Unknown project type');
  }
  const res = unique(result);
  res.filter(r => !r.parentModulePath || r.path === '/').forEach(r => (r.parentModulePath = null));
  return res;
};

import { parseRoutes as ngParseRoutes } from './angular';
import { parseReactTSXRoutes, parseReactJSXRoutes } from './react';
import { RoutingModule, ProjectType } from '../../common/interfaces';
import { detect } from './detector';
import { join } from 'path';

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
    result = parseReactTSXRoutes(app.details.tsconfigPath);
  }
  if (app.type === ProjectType.CreateReactApp && app.details && app.details.sourceDir) {
    result = parseReactJSXRoutes(join(base, app.details.sourceDir));
  }
  if (!result) {
    throw new Error('Unknown project type');
  }
  const res = unique(result);
  res.filter(r => !r.parentModulePath || r.path === '/').forEach(r => (r.parentModulePath = null));
  return res;
};

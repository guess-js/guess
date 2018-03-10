import { RoutingModule } from './interfaces';
import { parseRoutes as ngParseRoutes } from './ng';
import { parseRoutes as reactParseRoutes } from './react';

export * from './interfaces';

export enum ProjectType {
  Angular,
  React
}

const unique = (a: RoutingModule[]) => {
  const map: { [path: string]: RoutingModule } = {};
  a.forEach(r => (map[r.path] = r));
  return Object.keys(map).map(k => map[k]);
};

export const getLazyRoutes = (tsconfig: string, projectType: ProjectType) => {
  let result: RoutingModule[] | undefined = undefined;
  if (projectType === ProjectType.Angular) {
    result = ngParseRoutes(tsconfig);
  }
  if (projectType === ProjectType.React) {
    result = reactParseRoutes(tsconfig);
  }
  if (!result) {
    throw new Error('Unknown project type');
  }
  const res = unique(result.filter(r => r.lazy || !r.parentModulePath || r.path === '/'));
  const roots = res.filter(r => !r.parentModulePath || r.path === '/').forEach(r => (r.parentModulePath = null));
  return res;
};

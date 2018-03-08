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

export const getRoutes = (tsconfig: string, projectType: ProjectType) => {
  if (projectType === ProjectType.Angular) {
    return unique(ngParseRoutes(tsconfig));
  }
  if (projectType === ProjectType.React) {
    return unique(reactParseRoutes(tsconfig));
  }
  throw new Error('Unknown project type');
};

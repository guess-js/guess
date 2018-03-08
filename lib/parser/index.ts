import { parseRoutes as ngParseRoutes } from './ng';
import { parseRoutes as reactParseRoutes } from './react';

export * from './interfaces';

export enum ProjectType {
  Angular,
  React
}

export const getRoutes = (tsconfig: string, projectType: ProjectType) => {
  if (projectType === ProjectType.Angular) {
    return ngParseRoutes(tsconfig);
  }
  if (projectType === ProjectType.React) {
    return reactParseRoutes(tsconfig);
  }
  throw new Error('Unknown project type');
};

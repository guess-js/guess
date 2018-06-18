import { readFileSync, existsSync } from 'fs';
import {
  parseRoutes,
  parseAngularRoutes,
  parseReactTSXRoutes,
  parseReactJSXRoutes,
  parsePreactJSXRoutes
} from 'guess-parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule, ProjectType, ProjectLayout } from '../../common/interfaces';

type KnownMode = Mode.Angular | Mode.Gatsby | Mode.ReactJSX | Mode.ReactTSX | Mode.PreactJSX;

const defaultParsers: any = {
  [Mode.Angular](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('Path to tsconfig.json not provided');
    }
    return parseAngularRoutes(config.tsconfigPath);
  },
  [Mode.ReactTSX](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('Path to tsconfig.json not provided');
    }
    return parseReactTSXRoutes(config.tsconfigPath);
  },
  [Mode.ReactJSX](config?: ProjectLayout) {
    if (!config || !config.sourceDir) {
      throw new Error('Source directory not provided');
    }
    return parseReactJSXRoutes(config.sourceDir);
  },
  [Mode.PreactJSX](config?: ProjectLayout) {
    if (!config || !config.sourceDir) {
      throw new Error('Source directory not provided');
    }
    return parsePreactJSXRoutes(config.sourceDir);
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw new Error('Not supported');
  }
};

export const defaultRouteProvider = (mode: KnownMode, config?: ProjectLayout): RoutingModule[] =>
  defaultParsers[mode](config);

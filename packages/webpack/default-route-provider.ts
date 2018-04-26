import { readFileSync, existsSync } from 'fs';
import { parseRoutes, ngParseRoutes, reactParseRoutes } from 'guess-parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule, ProjectType, ProjectLayout } from 'common/interfaces';

type RoutingStrategies = { [strategy in Mode]: (config?: ProjectLayout) => RoutingModule[] };

const defaultParsers: RoutingStrategies = {
  [Mode.Angular](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('For Angular project specify a tsconfig file');
    }
    return ngParseRoutes(config.tsconfigPath);
  },
  [Mode.ReactTypescript](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('For React TypeScript project specify a tsconfig file');
    }
    return reactParseRoutes(config.tsconfigPath);
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw new Error('Not supported');
  },
  [Mode.Auto]() {
    return parseRoutes('');
  }
};

export const defaultRouteProvider = (mode: Mode, config?: ProjectLayout): (() => RoutingModule[]) => () =>
  defaultParsers[mode](config);

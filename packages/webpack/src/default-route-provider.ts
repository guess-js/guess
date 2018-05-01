import { readFileSync, existsSync } from 'fs';
import { parseRoutes, parseAngularRoutes, parseReactTSXRoutes, parseReactJSXRoutes } from 'guess-parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule, ProjectType, ProjectLayout } from 'common/interfaces';

type KnownMode = Mode.Angular | Mode.Gatsby | Mode.ReactJSX | Mode.ReactTSX;
type RoutingStrategies = { [strategy in KnownMode]: (config?: ProjectLayout) => RoutingModule[] };

const defaultParsers: RoutingStrategies = {
  [Mode.Angular](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('For Angular project specify a tsconfig file');
    }
    return parseAngularRoutes(config.tsconfigPath);
  },
  [Mode.ReactTSX](config?: ProjectLayout) {
    if (!config || !config.tsconfigPath) {
      throw new Error('For React TypeScript project specify a tsconfig file');
    }
    return parseReactTSXRoutes(config.tsconfigPath);
  },
  [Mode.ReactJSX](config?: ProjectLayout) {
    if (!config || !config.sourceDir) {
      throw new Error('For React TypeScript project specify a tsconfig file');
    }
    return parseReactJSXRoutes(config.sourceDir);
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw new Error('Not supported');
  }
};

export const defaultRouteProvider = (mode: KnownMode, config?: ProjectLayout): RoutingModule[] =>
  defaultParsers[mode](config);

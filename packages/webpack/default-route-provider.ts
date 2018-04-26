import { readFileSync, existsSync } from 'fs';
import { parseRoutes, ngParseRoutes, reactParseRoutes } from 'guess-parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule, ProjectType } from 'common/interfaces';

type RoutingStrategies = { [strategy in Mode]: () => RoutingModule[] };

const defaultParsers: RoutingStrategies = {
  [Mode.Angular]() {
    return ngParseRoutes();
  },
  [Mode.ReactTypescript]() {
    return reactParseRoutes();
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw new Error('Not supported');
  },
  [Mode.Auto]() {
    return parseRoutes('');
  }
};

export const defaultRouteProvider = (mode: Mode): RouteProvider => defaultParsers[mode];

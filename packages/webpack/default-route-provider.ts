import { readFileSync, existsSync } from 'fs';
import { parseRoutes } from 'guess-parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule, ProjectType } from 'common/interfaces';
import { detect } from 'guess-detector';

type RoutingStrategies = { [strategy in Mode]: () => RoutingModule[] };

const defaultParsers: RoutingStrategies = {
  [Mode.Angular]() {
    return parseRoutes({ type: ProjectType.AngularCLI, version: '' });
  },
  [Mode.ReactTypescript]() {
    return parseRoutes({ type: ProjectType.CreateReactAppTypeScript, version: '' });
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw new Error('Not supported');
  },
  [Mode.Auto]() {
    const app = detect('.');
    if (!app) {
      throw new Error('Unable to discover the project type');
    }
    return parseRoutes(app);
  }
};

export const defaultRouteProvider = (mode: Mode): RouteProvider => defaultParsers[mode];

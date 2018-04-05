import { readFileSync, existsSync } from 'fs';
import { ProjectType, parseRoutes } from '@mlx/parser';
import { RouteProvider, Mode } from './declarations';
import { RoutingModule } from 'common/interfaces';

type RoutingStrategies = { [strategy in Mode]: () => RoutingModule[] };

const defaultParsers: RoutingStrategies = {
  [Mode.Angular]() {
    return parseRoutes('src/tsconfig.app.json', ProjectType.Angular);
  },
  [Mode.ReactTypescript]() {
    return parseRoutes('tsconfig.json', ProjectType.React);
  },
  [Mode.Gatsby](): RoutingModule[] {
    throw 'Not supported';
  },
  [Mode.Auto]() {
    const path = ['package.json', '../package.json'].filter(existsSync).pop();
    let type: ProjectType | undefined = undefined;
    let tsconfigPath = '';
    if (!path) {
      throw new Error('Unable to discover the project type');
    }
    const content = JSON.parse(readFileSync(path).toString()) as any;
    if (content.dependencies['@angular/core']) {
      type = ProjectType.Angular;
      tsconfigPath = 'src/tsconfig.app.json';
    }
    if (content.dependencies['react']) {
      type = ProjectType.React;
      tsconfigPath = 'tsconfig.json';
    }
    if (type === undefined) {
      throw new Error('Unable to discover the project type');
    }
    return parseRoutes(tsconfigPath, type);
  }
};

export const defaultRouteProvider = (mode: Mode): RouteProvider => defaultParsers[mode];

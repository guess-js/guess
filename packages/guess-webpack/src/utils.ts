import { PrefetchConfig, BundleEntryGraph } from './declarations';
import { Graph, RoutingModule } from '../../common/interfaces';
import { join } from 'path';
import { Logger } from '../../common/logger';

export const defaultPrefetchConfig: PrefetchConfig = {
  '4g': 0.15,
  '3g': 0.3,
  '2g': 0.45,
  'slow-2g': 0.6
};

const validateInput = (
  routes: RoutingModule[],
  graph: Graph,
  logger: Logger,
  debug: boolean
) => {
  const routesInReport = new Set();
  Object.keys(graph).forEach(r => {
    routesInReport.add(r);
    Object.keys(graph[r]).forEach(c => routesInReport.add(c));
  });
  routes
    .map(r => r.path)
    .filter(x => !routesInReport.has(x))
    .forEach(r => {
      if (debug) {
        logger.debug(
          `The route ${r} is not present in the report or in the route declarations`
        );
      }
    });
};

export const buildMap = (
  routes: RoutingModule[],
  graph: Graph,
  logger: Logger,
  debug: boolean
): BundleEntryGraph => {
  validateInput(routes, graph, logger, debug);
  const result: BundleEntryGraph = {};
  const routeFile = {} as { [key: string]: string };
  routes.forEach(r => {
    routeFile[r.path] = r.modulePath;
  });
  Object.keys(graph).forEach(route => {
    result[route] = [];

    const sum = Object.keys(graph[route]).reduce(
      (a, n) => a + graph[route][n],
      0
    );
    Object.keys(graph[route]).forEach(n => {
      result[route].push({
        route: n,
        probability: graph[route][n] / sum,
        file: routeFile[n]
      });
    });
    result[route] = result[route].sort((a, b) => b.probability - a.probability);
  });
  return result;
};

export const stripExtension = (path: string) => path.replace(/\.(j|t)sx?$/, '');

export interface Compilation {
  getStats(): { toJson(): JSCompilation };
}

export interface JSReason {
  module: string;
  moduleId: string;
}

export interface JSModule {
  name: string;
  reasons: JSReason[];
}

export interface JSOrigin {
  name: string;
  moduleName: string;
  module: string;
}

export interface JSChunk {
  files: string[];
  initial: boolean;
  modules: JSModule[];
  origins: JSOrigin[];
}

export interface JSCompilation {
  chunks: JSChunk[];
}

export const getCompilationMapping = (
  compilation: Compilation,
  entryPoints: Set<string>,
  logger: Logger,
  debug?: boolean
): { mainName: string | null; fileChunk: { [path: string]: string } } => {
  const fileChunk: { [path: string]: string } = {};

  let mainName: string | null = null;
  function getModulePath(moduleName: string): string | null {
    const cwd = process.cwd();
    const relativePath = moduleName
      .split(' ')
      .filter(p => /(\.)?(\/|\\)/.test(p))
      .pop();
    if (relativePath === undefined) {
      return null;
    }
    const jsPath = stripExtension(
      relativePath.replace(/\.ngfactory\.js$/, '.js')
    );
    return join(cwd, jsPath);
  }

  compilation
    .getStats()
    .toJson()
    .chunks.forEach(c => {
      if (!c.files[0].endsWith('.js')) {
        return;
      }
      if (c.initial) {
        const pickers = [
          (f: string) => f.startsWith('main'),
          (f: string) => f.startsWith('runtime'),
          (f: string) => f.startsWith('vendor'),
          (f: string) => f.endsWith('.js'),
        ]
        while (!mainName && pickers.length) {
          mainName = c.files.filter(pickers.shift()!).pop()!;
        }
      }
      if (c.modules && c.modules.length) {
        const existingEntries = c.modules.filter(m => {
          const path = getModulePath(m.name);
          if (!path) {
            return false;
          }
          return entryPoints.has(path);
        });
        if (existingEntries.length > 1) {
          logger.debug(
            'There are more than two entry points associated with chunk',
            c.files[0]
          );
        } else if (existingEntries.length === 0) {
          logger.debug('Cannot find entry point for chunk: ' + c.files[0]);
        } else {
          const path = getModulePath(existingEntries[0].name);
          if (path) {
            fileChunk[path] = c.files[0];
          }
        }
      } else {
        logger.debug('Cannot find modules for chunk', c.files[0]);
      }
    });

  return { mainName, fileChunk };
};

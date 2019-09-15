import { PrefetchConfig, BundleEntryGraph, FileChunkMap } from './declarations';
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
  id: string;
  name: string;
  reasons: JSReason[];
  chunks: number[];
}

export interface JSOrigin {
  name: string;
  moduleName: string;
  module: string;
}

export interface JSChunk {
  id: number;
  files: string[];
  initial: boolean;
  modules: JSModule[];
  origins: JSOrigin[];
}

export interface JSCompilation {
  chunks: JSChunk[];
  modules: JSModule[];
}

interface ChunkGraph {
  [chunk: string]: Set<string>;
}

const getChunkJsFile = (chunk: JSChunk) => {
  return chunk.files.filter(f => f.endsWith('.js')).shift();
};

const getChunkDependencyGraph = (stats: JSCompilation): ChunkGraph => {
  const chunkGraph: ChunkGraph = {};

  const chunkIdToChunk: {[id: number]: JSChunk} = {};
  stats.chunks.forEach(chunk => chunkIdToChunk[chunk.id] = chunk);

  const moduleIdToModule: {[id: string]: JSModule} = {};
  stats.modules.forEach(module => moduleIdToModule[module.id] = module);

  stats.modules.forEach(module => {
    const moduleChunks = module.chunks.map(id => chunkIdToChunk[id]);
    module.reasons.forEach(reason => {
      const dependent = moduleIdToModule[reason.moduleId];
      if (!dependent) {
        return;
      }
      const dependentChunks = dependent.chunks.map(id => chunkIdToChunk[id]);
      dependentChunks.forEach(dependentChunk => {
        const file = getChunkJsFile(dependentChunk);
        if (!file) {
          return;
        }
        chunkGraph[file] = chunkGraph[file] || new Set<string>();
        moduleChunks.forEach(dependencyChunk => {
          if (dependencyChunk.initial) {
            return;
          }
          const dependencyFile = getChunkJsFile(dependencyChunk);
          if (!dependencyFile) {
            return;
          }
          chunkGraph[file].add(dependencyFile);
        });
      });
    });
  });
  return chunkGraph;
};

export const getCompilationMapping = (
  compilation: Compilation,
  entryPoints: Set<string>,
  logger: Logger,
): { mainName: string | null; fileChunk: FileChunkMap } => {

  let mainName: string | null = null;
  let mainPriority = Infinity;
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

  const jsonStats = compilation.getStats().toJson();

  const chunkDepGraph = getChunkDependencyGraph(jsonStats);
  logger.debug('Chunk dependency graph', chunkDepGraph);

  const fileChunk: FileChunkMap = {};

  jsonStats
    .chunks.forEach(c => {
      const jsFile = getChunkJsFile(c);
      if (!jsFile) {
        return;
      }
      if (c.initial) {
        const pickers = [
          (f: string) => f.startsWith('main') && f.endsWith('.js'),
          (f: string) => f.indexOf('/main') >= 0 && f.endsWith('.js'),
          (f: string) => f.startsWith('runtime') && f.endsWith('.js'),
          (f: string) => f.indexOf('/runtime') >= 0 && f.endsWith('.js'),
          (f: string) => f.startsWith('vendor') && f.endsWith('.js'),
          (f: string) => f.indexOf('/vendor') >= 0 && f.endsWith('.js'),
          (f: string) => f.startsWith('common') && f.endsWith('.js'),
          (f: string) => f.endsWith('.js'),
        ]
        let currentMain = null;
        let currentPriority = 0;
        while (!currentMain && pickers.length) {
          currentMain = c.files.filter(pickers.shift()!).pop()!;
          currentPriority++;
        }
        if (mainPriority > currentPriority) {
          mainName = currentMain;
          mainPriority = currentPriority;
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
            jsFile
          );
        } else if (existingEntries.length === 0) {
          logger.debug('Cannot find entry point for chunk: ' + jsFile);
        } else {
          const path = getModulePath(existingEntries[0].name);
          if (path) {
            fileChunk[path] = fileChunk[path] || { file: jsFile, deps: chunkDepGraph[jsFile] };
          }
        }
      } else {
        logger.debug('Cannot find modules for chunk', jsFile);
      }
    });

  return { mainName, fileChunk };
};

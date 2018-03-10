import { ProjectType, parseRoutes } from 'route-parser';

import { Graph, RoutingModule } from '../common/interfaces';
import { RouteProvider, ClusterizationAlgorithm } from './interfaces';

import { RuntimePrefetchPlugin, RuntimePrefetchConfig } from './runtime';
import { ClusterizeChunksPlugin } from './build';

export interface BuildConfig {
  minChunks: number;
  algorithm?: ClusterizationAlgorithm;
}

export interface RuntimeConfig {
  basePath: string;
}

export interface PageGraphMLPluginConfig {
  debug?: boolean;
  runtime?: false | RuntimeConfig;
  build: false | BuildConfig;
  routeProvider?: RouteProvider;
  data: Graph;
}

const defaultRouteProvider = (): RouteProvider => {
  let type: ProjectType | undefined = undefined;
  let tsconfigPath = '';
  try {
    require('@angular/core');
    type = ProjectType.Angular;
    tsconfigPath = 'src/tsconfig.app.json';
  } catch (e) {
    try {
      require('react');
      type = ProjectType.React;
      tsconfigPath = 'tsconfig.json';
    } catch (e) {}
  }
  if (type === undefined) {
    throw new Error('Unable to discover the project type');
  }
  return () => parseRoutes(tsconfigPath, type);
};

export class PageGraphMLPlugin {
  private _runtime: RuntimePrefetchPlugin;
  private _build: ClusterizeChunksPlugin;

  constructor(private _config: PageGraphMLPluginConfig) {
    const runtime = _config.runtime;
    const routeProvider = _config.routeProvider || defaultRouteProvider();
    const routes = routeProvider();
    if (runtime !== false) {
      this._runtime = new RuntimePrefetchPlugin({
        data: _config.data,
        basePath: runtime ? runtime.basePath : '/',
        debug: _config.debug,
        routes
      });
    }
    const build = this._config.build;
    if (build !== false) {
      this._build = new ClusterizeChunksPlugin({
        minChunks: build.minChunks,
        algorithm: build.algorithm,
        moduleGraph: toBundleGraph(this._config.data, routes),
        debug: _config.debug,
        modules: routeProvider()
      });
    }
  }

  apply(compiler: any) {
    if (this._build) {
      this._config.debug && console.debug('Applying the build-time plugin');
      this._build.apply(compiler);
    }
    if (this._runtime) {
      this._config.debug && console.debug('Applying the runtime-time plugin');
      this._runtime.apply(compiler);
    }
  }
}

const toBundleGraph = (graph: Graph, defs: RoutingModule[]): Graph => {
  const res: Graph = {};
  const routeFile = defs.reduce(
    (a, c: RoutingModule) => {
      a[c.path.replace('/.', '')] = c.modulePath;
      return a;
    },
    {} as { [key: string]: string }
  );
  Object.keys(graph).forEach((k: string) => {
    const from = routeFile[k];
    if (from === undefined) {
      // console.warn('Cannot find file for the route ' + k);
      return;
    }
    res[from] = res[from] || {};
    Object.keys(graph[k]).forEach(n => {
      const to = routeFile[n];
      if (to === undefined) {
        // console.warn('Cannot find file for the route ' + n);
        return;
      }

      res[from][to] = (res[from][to] || 0) + graph[k][n];
    });
  });
  return res;
};

const nameBundles = (clusters: (string | string[])[]) => {
  return clusters.reduce(
    (a, c, i) => {
      a[i.toString()] = c;
      return a;
    },
    {} as { [key: string]: string | string[] }
  );
};

import { RoutingModule, ProjectType } from '../parser';
import { Graph } from '../store/store';
import { Module } from '../ml/clusterize';
import RuntimePrefetchPlugin, { RuntimePrefetchConfig } from './runtime';
import ClusterizeChunksPlugin from './build';
import { parseRoutes as parseNgRoutes } from '../parser/ng';
import { parseRoutes as parseReactRoutes } from '../parser/react';

export interface RouteProvider {
  (): RoutingModule[];
}

export type Cluster = string[];
export type Clusters = Cluster[];

export interface ClusterizationAlgorithm {
  (graph: Graph, modules: Module[], totalClusters: number): Clusters;
}

export interface BuildConfig {
  totalClusters: number;
  algorithm?: ClusterizationAlgorithm;
}

export interface RuntimeConfig {
  basePath: string;
}

export interface GAMLPluginConfig {
  runtime?: false | RuntimeConfig;
  build: false | BuildConfig;
  routeProvider?: RouteProvider;
  data: Graph;
}

const defaultRouteProvider: (path: string) => RouteProvider = (path: string) => {
  const type: ProjectType = ProjectType.Angular;
  const tsconfigPath = path;
  return () => {
    if (type === ProjectType.Angular) {
      return parseNgRoutes(tsconfigPath);
    }
    return parseReactRoutes(tsconfigPath);
  };
};

export class GAMLPlugin {
  private _runtime: RuntimePrefetchPlugin;
  private _build: ClusterizeChunksPlugin;

  constructor(private _config: GAMLPluginConfig) {
    const runtime = this._config.runtime;
    const routeProvider = this._config.routeProvider || defaultRouteProvider('');
    const routes = routeProvider();
    if (runtime !== false) {
      this._runtime = new RuntimePrefetchPlugin({
        data: this._config.data,
        basePath: runtime ? runtime.basePath : '/',
        routes
      });
    }
    const build = this._config.build;
    if (build !== false) {
      this._build = new ClusterizeChunksPlugin({
        totalChunks: build.totalClusters,
        algorithm: build.algorithm,
        moduleGraph: toBundleGraph(this._config.data, routes),
        modules: routeProvider()
      });
    }
  }

  apply(compiler: any) {
    if (this._build) {
      this._build.apply(compiler);
    }
    if (this._runtime) {
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

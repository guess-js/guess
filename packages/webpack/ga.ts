import { RoutingModule } from '../parser';
import { Graph } from '../store/store';
import { Module } from '../ml/clusterize';
import RuntimePrefetchPlugin, { RuntimePrefetchConfig } from './runtime';
import ClusterizeChunksPlugin from './build';
import { fetch } from '../ga';

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
  credentials: { key: string; viewId: string };
  metric?: string;
  period: { start: string; end: string };
}

class MLPlugin {}

export const defaultRouteProvider: RouteProvider = undefined;

export class GAMLPlugin {
  private _runtime: RuntimePrefetchPlugin;
  private _build: ClusterizeChunksPlugin;
  private _routes: RoutingModule[];

  constructor(private _config: GAMLPluginConfig) {}

  apply(compiler: any) {
    if (this._build) {
      this._build.apply(compiler);
    }
    if (this._runtime) {
      this._runtime.apply(compiler);
    }
  }

  private _fetchData() {
    const { key, viewId } = this._config.credentials;
    const { start, end } = this._config.period;
    this._routes = (this._config.routeProvider || defaultRouteProvider)();
    fetch(
      key,
      viewId,
      {
        startDate: new Date(start),
        endDate: new Date(end)
      },
      r => r.replace('/app', ''),
      this._routes.map(r => r.path)
    );
  }

  private _init(data: Graph) {
    const runtime = this._config.runtime;
    if (runtime !== false) {
      this._runtime = new RuntimePrefetchPlugin({
        data,
        basePath: runtime ? runtime.basePath : '/',
        routes: this._routes
      });
    }
    const build = this._config.build;
    if (build !== false) {
      this._build = new ClusterizeChunksPlugin({
        totalChunks: build.totalClusters,
        algorithm: build.algorithm,
        moduleGraph: toBundleGraph(data, this._routes),
        modules: this._routes
      });
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

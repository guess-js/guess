import { RouteProvider, PrefetchConfig } from './declarations';
import { PrefetchPlugin } from './prefetch-plugin';
import { Graph, RoutingModule, Period, ProjectLayout } from '../../common/interfaces';
import { getReport } from './ga-provider';

export interface RuntimeConfig {
  /** @internal */
  basePath?: string;
  /** @internal */
  prefetchConfig?: PrefetchConfig;
  /** @internal */
  delegate: boolean;
}

export interface GuessPluginConfig {
  GA?: string;
  jwt?: any;
  period?: Period;
  reportProvider?: (...args: any[]) => Promise<Graph>;

  /** @internal */
  routeProvider?: RouteProvider | boolean;
  /** @internal */
  routeFormatter?: (path: string) => string;
  /** @internal */
  runtime?: RuntimeConfig;
}

const extractRoutes = (config: GuessPluginConfig): Promise<RoutingModule[]> => {
  if (config.routeProvider === false || config.routeProvider === undefined) {
    return Promise.resolve([]);
  }
  if (typeof config.routeProvider === 'function') {
    return Promise.resolve(config.routeProvider());
  }
  throw new Error('The routeProvider should be either set to false or a function which returns the routes in the app.');
};

export class GuessPlugin {
  constructor(private _config: GuessPluginConfig) {
    if ((this._config.GA || this._config.jwt) && this._config.reportProvider) {
      throw new Error(
        'Only a single report provider is allowed. You have specified `GA` and/or ' +
          'a GA authentication provider (used by Google Analytics provider) and `reportProvider`'
      );
    }
    if (!this._config.GA && !this._config.reportProvider) {
      throw new Error(
        'Report provider not specified. You should specify either a `GA` (Google Analytics view ID) or `reportProvider`.'
      );
    }
  }

  apply(compiler: any) {
    compiler.plugin('emit', (compilation: any, cb: any) => this._execute(compilation, cb));
  }

  private _execute(compilation: any, cb: any) {
    extractRoutes(this._config).then(routes => {
      return this._getReport(routes).then(
        data => {
          return this._executePrefetchPlugin(data, routes, compilation, cb);
        },
        err => {
          console.error(err);
          cb();
          throw err;
        }
      );
    });
  }

  private _getReport(routes: RoutingModule[]): Promise<Graph> {
    if (this._config.GA) {
      return getReport({
        jwt: this._config.jwt,
        viewId: this._config.GA,
        routes,
        formatter: this._config.routeFormatter,
        period: this._config.period
      });
    } else {
      return this._config.reportProvider!();
    }
  }

  private _executePrefetchPlugin(data: Graph, routes: RoutingModule[], compilation: any, cb: any) {
    const { runtime } = this._config;
    new PrefetchPlugin({
      data,
      basePath: runtime ? (runtime.basePath === undefined ? '' : runtime.basePath) : '',
      prefetchConfig: runtime ? runtime.prefetchConfig : undefined,
      routes,
      delegate: runtime ? !!runtime.delegate : true
    }).execute(compilation, cb);
  }
}

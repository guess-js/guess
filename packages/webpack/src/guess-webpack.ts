import { Mode, RouteProvider, PrefetchConfig } from './declarations';
import { defaultRouteProvider } from './default-route-provider';
import { PrefetchPlugin } from './prefetch-plugin';
import { Graph, RoutingModule, Period, ProjectLayout } from '../../common/interfaces';
import { parseRoutes } from 'guess-parser';
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
  reportProvider?: (...args: any[]) => Promise<Graph>;
  mode?: Mode;
  layout?: ProjectLayout;
  period?: Period;
  /** @internal */
  routeFormatter?: (path: string) => string;
  /** @internal */
  debug?: boolean;
  /** @internal */
  runtime?: RuntimeConfig;
  /** @internal */
  routeProvider?: RouteProvider | boolean;
}

export class GuessPlugin {
  constructor(private _config: GuessPluginConfig) {
    if (this._config.GA && this._config.reportProvider) {
      throw new Error(
        'Only a single report provider is allowed. You have specified `GA` (used by Google Analytics provider) and `reportProvider`'
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
      this._getReport(routes).then(
        data => {
          return this._executePrefetchPlugin(data, routes, compilation, cb);
        },
        err => {
          cb();
          throw err;
        }
      );
    });
  }

  private _getReport(routes: RoutingModule[]): Promise<Graph> {
    if (this._config.GA) {
      return getReport({
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
      debug: this._config.debug,
      routes,
      delegate: runtime ? !!runtime.delegate : false
    }).execute(compilation, cb);
  }
}

const extractRoutes = (config: GuessPluginConfig): Promise<RoutingModule[]> => {
  if (config.routeProvider === false) {
    return Promise.resolve([]);
  }
  if (typeof config.routeProvider === 'function') {
    return Promise.resolve(config.routeProvider());
  }
  if (!config.mode || config.mode === Mode.Auto) {
    return Promise.resolve(parseRoutes(process.env.PWD!));
  }
  return Promise.resolve(defaultRouteProvider(config.mode, config.layout));
};

import { fetch } from 'guess-ga';

import { existsSync, readFileSync } from 'fs';
import { shim } from 'promise.prototype.finally';

import { Mode, RouteProvider, PrefetchConfig } from './declarations';
import { defaultRouteProvider } from './default-route-provider';
import { Prefetch } from './prefetch';
import { Graph, RoutingModule, Period, ProjectLayout } from 'common/interfaces';
import { parseRoutes } from 'guess-parser';
import { getReport } from './ga-provider';

shim();

export interface RuntimeConfig {
  /** @internal */
  basePath?: string;
  /** @internal */
  prefetchConfig?: PrefetchConfig;
  /** @internal */
  delegate: boolean;
}

export interface GuessPluginConfig {
  GA: string;
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
  constructor(private _config: GuessPluginConfig) {}

  apply(compiler: any) {
    compiler.plugin('emit', (compilation: any, cb: any) => this._execute(compilation, cb));
  }

  private _execute(compilation: any, cb: any) {
    const routes = extractRoutes(this._config);
    getReport({
      viewId: this._config.GA,
      routes,
      formatter: this._config.routeFormatter,
      period: this._config.period
    })
      .then(
        data => this._executePrefetchPlugin(data, routes, compilation),
        err => {
          throw err;
        }
      )
      .finally(cb);
  }

  private _executePrefetchPlugin(data: Graph, routes: RoutingModule[], compilation: any) {
    const { runtime } = this._config;
    new Prefetch({
      data,
      basePath: runtime ? runtime.basePath : '/',
      prefetchConfig: runtime ? runtime.prefetchConfig : undefined,
      debug: this._config.debug,
      routes,
      delegate: runtime ? !!runtime.delegate : false
    }).apply(compilation);
  }
}

const extractRoutes = (config: GuessPluginConfig) => {
  if (config.routeProvider === false) {
    return [];
  }
  if (typeof config.routeProvider === 'function') {
    return config.routeProvider();
  }
  if (!config.mode || config.mode === Mode.Auto) {
    return parseRoutes(process.env.PWD!);
  }
  return defaultRouteProvider(config.mode, config.layout);
};

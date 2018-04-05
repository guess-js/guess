import { ProjectType, parseRoutes } from '@mlx/parser';
import { fetch } from '@mlx/ga';

import { Graph, RoutingModule, Period } from '../common/interfaces';
import { auth } from 'google-oauth2-node';
const { google } = require('googleapis');

import { RuntimePrefetchPlugin, RuntimePrefetchConfig, PrefetchConfig } from './runtime';
import { ClusterChunksPlugin } from './build';

import { existsSync, readFileSync } from 'fs';

import { defaultRouteProvider } from './default-route-provider';
import { Mode, RouteProvider } from './declarations';

import { shim } from 'promise.prototype.finally';
shim();

export interface RuntimeConfig {
  basePath?: string;
  prefetchConfig?: PrefetchConfig;
}

export interface MLPluginConfig {
  viewId: string;
  mode?: Mode;
  period?: Period;
  routeFormatter?: (path: string) => string;
  debug?: boolean;
  runtime?: false | RuntimeConfig;
  routeProvider?: RouteProvider;
}

const id = <T>(r: T) => r;
const Year = 365 * 24 * 60 * 60 * 1000;

export class MLPlugin {
  constructor(private _config: MLPluginConfig) {}

  apply(compiler: any) {
    compiler.plugin('emit', (compilation: any, cb: any) => this._execute(compilation, cb));
  }

  private _execute(compilation: any, cb: any) {
    auth({
      clientId: '329457372673-hda3mp2vghisfobn213jpj8ck1uohi2d.apps.googleusercontent.com',
      clientSecret: '4camaoQPOz9edR-Oz19vg-lN',
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    }).then((auth: any) => {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(auth);

      const runtimeConfig = this._config.runtime;
      const routes = (this._config.routeProvider || defaultRouteProvider(this._config.mode || Mode.Auto))();

      fetch({
        viewId: this._config.viewId,
        auth: oauth2Client,
        period: this._config.period || { startDate: new Date(), endDate: new Date(Date.now() - Year) },
        routes: routes.map(r => r.path),
        formatter: this._config.routeFormatter || id
      })
        .then(
          data => {
            const runtime = new RuntimePrefetchPlugin({
              data,
              basePath: this._config.runtime ? this._config.runtime.basePath : '/',
              prefetchConfig: runtimeConfig ? runtimeConfig.prefetchConfig : undefined,
              debug: this._config.debug,
              routes
            });
            runtime.apply(compilation);
          },
          err => {
            throw err;
          }
        )
        .finally(cb);
    });
  }
}

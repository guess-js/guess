import { ProjectType, parseRoutes } from '@mlx/parser';
import { fetch } from '@mlx/ga';

import { Graph, RoutingModule, Period } from '../common/interfaces';
import { RouteProvider, ClusteringAlgorithm } from './interfaces';
import { auth } from 'google-oauth2-node';
const { google } = require('googleapis');

import { RuntimePrefetchPlugin, RuntimePrefetchConfig, PrefetchConfig } from './runtime';
import { ClusterChunksPlugin } from './build';

import { existsSync, readFileSync } from 'fs';

export interface RuntimeConfig {
  basePath?: string;
  prefetchConfig?: PrefetchConfig;
}

export interface MLPluginConfig {
  routeFormatter?: (path: string) => string;
  period?: Period;
  debug?: boolean;
  runtime?: false | RuntimeConfig;
  routeProvider?: RouteProvider;
  viewId: string;
}

const id = <T>(r: T) => r;
const Year = 365 * 24 * 60 * 60 * 1000;

const defaultRouteProvider = (): RouteProvider => {
  let type: ProjectType | undefined = undefined;
  let tsconfigPath = '';
  const path = ['package.json', '../package.json'].filter(existsSync).pop();
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
  return () => parseRoutes(tsconfigPath, type);
};

export class MLPlugin {
  private _runtime: RuntimePrefetchPlugin;

  constructor(private _config: MLPluginConfig) {}

  apply(compiler: any) {
    auth({
      clientId: '329457372673-hda3mp2vghisfobn213jpj8ck1uohi2d.apps.googleusercontent.com',
      clientSecret: '4camaoQPOz9edR-Oz19vg-lN',
      scope: 'https://www.googleapis.com/auth/analytics.readonly'
    }).then((auth: any) => {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(auth);
      const runtime = this._config.runtime;
      const routes = (this._config.routeProvider || defaultRouteProvider())();
      fetch({
        viewId: this._config.viewId,
        auth: oauth2Client,
        period: this._config.period || { startDate: new Date(), endDate: new Date(Date.now() - Year) },
        routes: routes.map(r => r.path),
        formatter: this._config.routeFormatter || id
      }).then(
        data => {
          this._runtime = new RuntimePrefetchPlugin({
            data,
            basePath: this._config.runtime ? this._config.runtime.basePath : '/',
            prefetchConfig: runtime ? runtime.prefetchConfig : undefined,
            debug: this._config.debug,
            routes
          });
        },
        err => {
          throw err;
        }
      );
    });
    if (this._runtime) {
      this._config.debug && console.debug('Applying the runtime-time plugin');
      this._runtime.apply(compiler);
    }
  }
}

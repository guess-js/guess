import { getClient, Period } from './client';
import { normalize } from './normalize';
import { Graph } from '../common/interfaces';

const PageSize = 1000;
const noop = (r: string) => r;
const DefaultExpression = 'ga:users';

async function fetchData(
  routeDeclarations: string[],
  formatter: (r: string) => string,
  jwtClient: any,
  viewId: string,
  period: Period,
  expression: string
) {
  const client = getClient(jwtClient, PageSize, viewId, period, expression);
  const graph: Graph = {};
  for await (const val of client()) {
    if (val.error) {
      throw val.error;
    }
    const result = val.report;
    normalize(result.data, formatter, routeDeclarations).forEach((n: any) => {
      const r = graph[n.from] || {};
      r[n.to] = n.weight + (r[n.to] || 0);
      graph[n.from] = r;
    });
  }
  return graph;
}

export interface FetchConfig {
  key: any;
  viewId: string;
  period: Period;
  formatter?: (route: string) => string;
  routeDeclarations?: string[];
  expression?: string;
}

export function fetch(config: FetchConfig): Promise<Graph> {
  return new Promise((resolve, reject) => {
    const { google } = require('googleapis');

    const jwtClient = new google.auth.JWT(
      config.key.client_email,
      null,
      config.key.private_key,
      ['https://www.googleapis.com/auth/analytics.readonly'],
      null
    );

    jwtClient.authorize(function(err: any, tokens: any) {
      if (err) {
        reject(err);
        return;
      }
      fetchData(
        config.routeDeclarations || [],
        config.formatter || noop,
        jwtClient,
        config.viewId,
        config.period,
        config.expression || DefaultExpression
      ).then(resolve, reject);
    });
  });
}

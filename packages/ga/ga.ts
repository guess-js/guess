import { getClient, Period } from './client';
import { normalize } from './normalize';
import { Graph } from '../common/interfaces';

const PageSize = 1000;

async function fetchData(
  routeDeclarations: string[],
  formatter: (r: string) => string,
  jwtClient: any,
  viewId: string,
  period: Period
) {
  const client = getClient(jwtClient, PageSize, viewId, period);
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

const noop = (r: string) => r;

export function fetch(
  key: any,
  viewId: string,
  period: Period,
  formatter = noop,
  routeDeclarations: string[] = []
): Promise<Graph> {
  return new Promise((resolve, reject) => {
    const { google } = require('googleapis');

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/analytics.readonly'],
      null
    );

    jwtClient.authorize(function(err: any, tokens: any) {
      if (err) {
        reject(err);
        return;
      }
      fetchData(routeDeclarations, formatter, jwtClient, viewId, period).then(resolve, reject);
    });
  });
}

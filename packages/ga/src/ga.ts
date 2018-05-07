import { getClient } from './client';
import { normalize } from './normalize';
import { Graph, Period } from '../../common/interfaces';

const PageSize = 1000;
const id = (r: string) => r;
const DefaultExpression = 'ga:pageviews';

export interface FetchConfig {
  auth: any;
  viewId: string;
  period: Period;
  formatter?: (route: string) => string;
  routes?: string[];
  expression?: string;
}

export async function fetch(config: FetchConfig) {
  const client = getClient(config.auth, PageSize, config.viewId, config.period, config.expression || DefaultExpression);
  const graph: Graph = {};
  for await (const val of client()) {
    if (val.error) {
      throw val.error;
    }
    const result = val.report;
    normalize(result.data, config.formatter || id, config.routes || []).forEach((n: any) => {
      const r = graph[n.from] || {};
      r[n.to] = n.weight + (r[n.to] || 0);
      graph[n.from] = r;
    });
  }
  return graph;
}

import { parseRoutes, RouteDefinition } from './ng/index';
import { dbStorage, Graph } from './store/store';
import * as meow from 'meow';

const cli = meow(
  `Usage
$ smarty <options>

Options
--view-id, -v Google Anaytics View ID
--project, -p TypeScript project

Examples
$ smarty 
  --view-id 11111
  --project tsconfig.json
`,
  {
    flags: {
      viewId: {
        type: 'string',
        alias: 'v'
      },
      project: {
        type: 'string',
        alias: 'p'
      }
    }
  }
);

const viewId = cli.flags.viewId;

export interface Neighbor {
  route: string;
  file: string;
  probability: number;
}

export interface RuntimeMap {
  [route: string]: Neighbor[];
}

const buildMap = (routes: RouteDefinition[], graph: Graph) => {
  const result: RuntimeMap = {};
  const routeFile = {} as { [key: string]: string };
  routes.forEach(r => {
    routeFile[r.path] = r.module;
  });
  Object.keys(graph).forEach(k => {
    result[k] = [];

    const sum = Object.keys(graph[k]).reduce((a, n) => a + graph[k][n], 0);
    Object.keys(graph[k]).forEach(n => {
      result[k].push({
        route: n,
        probability: graph[k][n] / sum,
        file: routeFile[n]
      });
    });
    result[k] = result[k].sort((a, b) => b.probability - a.probability);
  });
  return result;
};

dbStorage(viewId)
  .all()
  .then(graph => {
    const routes = parseRoutes(cli.flags.project);
    console.log(JSON.stringify(buildMap(routes, graph), null, 2));
  });

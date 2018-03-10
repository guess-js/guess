import { ProjectType } from './parser/index';
import { getLazyRoutes, RoutingModule } from './parser';
import { dbStorage, Graph } from './store/store';
import * as meow from 'meow';

const cli = meow(
  `Usage
$ smarty <options>

Options
--view-id, -v Google Anaytics View ID
--project, -p TypeScript project
--type, -t Project type ("angular" and "react" supported)

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
      },
      type: {
        type: 'string',
        alias: 't'
      }
    }
  }
);

const viewId = cli.flags.viewId;
const type = cli.flags.type;

export interface Neighbor {
  route: string;
  file: string;
  probability: number;
}

export interface RuntimeMap {
  [route: string]: Neighbor[];
}

const buildMap = (routes: RoutingModule[], graph: Graph) => {
  const result: RuntimeMap = {};
  const routeFile = {} as { [key: string]: string };
  routes.forEach(r => {
    routeFile[r.path] = r.modulePath;
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
    const routes = getLazyRoutes(cli.flags.project, type === 'angular' ? ProjectType.Angular : ProjectType.React);
    console.log(JSON.stringify(buildMap(routes, graph), null, 2));
  });

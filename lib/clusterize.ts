import { clusterize } from './ml/clusterize';
import { parseRoutes, RouteDefinition } from './ng/index';
import { dbStorage, Graph } from './store/store';
import * as minimist from 'minimist';
import chalk from 'chalk';

import * as meow from 'meow';

const error = (s: string) => {
  console.error(chalk.red(s));
  process.exit(1);
};

const cli = meow(
  `
Usage
$ smarty <options>

Options
--view-id, -v Google Anaytics View ID
--clusters, -n Total different bundles
--project, -p TypeScript project

Examples
$ smarty --view-id 11111 --clusters 5 --project tsconfig.json
`,
  {
    flags: {
      viewId: {
        type: 'string',
        alias: 'v'
      },
      clusters: {
        type: 'string',
        alias: 'n'
      },
      project: {
        type: 'string',
        alias: 'p'
      }
    }
  }
);

const toBundleGraph = (graph: Graph, defs: RouteDefinition[]): Graph => {
  const res: Graph = {};
  const routeFile = defs.reduce(
    (a, c: RouteDefinition) => {
      a[c.path.replace('/.', '')] = c.module;
      return a;
    },
    {} as { [key: string]: string }
  );
  Object.keys(graph).forEach((k: string) => {
    const from = routeFile[k];
    res[from] = res[from] || {};
    Object.keys(graph[k]).forEach(n => {
      const to = routeFile[n];
      res[from][to] = (res[from][to] || 0) + graph[k][n];
    });
  });
  return res;
};

const nameBundles = (clusters: (string | string[])[]) => {
  return clusters.reduce(
    (a, c, i) => {
      a[i.toString()] = c;
      return a;
    },
    {} as { [key: string]: string | string[] }
  );
};

const viewId = cli.flags.viewId;
const total = parseInt(cli.flags.clusters, 10);
const project = cli.flags.project;

if (!viewId) {
  error('View id is mandatory');
}
if (!total) {
  error('Must specify number of bundles');
}

if (!project) {
  error('For clusterization you need to provide a project');
}

dbStorage(viewId)
  .all()
  .then(g => {
    console.time('parseRoutes');
    const modules = parseRoutes(project);
    console.timeEnd('parseRoutes');

    console.time('clusterize');
    console.log(nameBundles(clusterize(toBundleGraph(g, modules), modules, total)));
    console.timeEnd('clusterize');
  });

import { clusterize } from './ml/clusterize';
import { parseRoutes, RouteDefinition } from './ng/index';
import { dbStorage } from './store/store';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { fetch } from './fetch';
import { listen } from './report';

const argv = minimist(process.argv);

const o = (n: string) => chalk.yellow(n);
const c = (n: string) => chalk.blue(n);
const d = (n: string) => chalk.gray(n);
const error = (s: string) => {
  console.error(chalk.red(s));
  process.exit(1);
};

if (argv.h) {
  console.log(`
Welcome to Smarty!

${c('fetch')} ${o('-v')} ${o('[view_id]')} ${o('-c')} ${o('[credentials]')} ${o('-s')} ${o('[start_date]')} ${o(
    '-e'
  )} ${o('[end_date]')} ${o('-a')} ${o('[aggregate]')} ${o('-p')} ${o(
    '[project_path]'
  )} ${d(`Fetches data from Google Analytics and stores it in levelgraph.
  Provide the view id of your page and credentials JSON file.`)}
${chalk.blue('report')} ${o('-p')} ${o('[port]')} ${d(
    `Starts a server which lets you explore the flow for given view.`
  )}
${chalk.blue('clusterize')} ${o('-v')} ${o('[view_id]')} ${o('-n')} ${o('[total]')} ${d(
    `Returns the optimal bundles of your application`
  )}
`);
  process.exit(0);
}

const isFetch = argv._.indexOf('fetch') >= 0;
const isReport = argv._.indexOf('report') >= 0;
const isClusterize = argv._.indexOf('clusterize') >= 0;

[isFetch, isReport, isClusterize].reduce((a, c) => {
  if (a && c) {
    error('You can specify only "report", "fetch", or "ng-routes" in the same time');
  }
  return a || c;
}, false);

if (isFetch) {
  const key = require(argv.c);
  const viewId = argv.v;
  const start = argv.s;
  const end = argv.e;

  if (!viewId) {
    error('View id is mandatory');
  }

  if (!start || !end) {
    error('Start and end dates are mandatory');
  }

  if (argv.a && !argv.p) {
    error('For aggregated information you should provide a project path');
  }

  let applicationRoutes: RouteDefinition[] = [];
  if (argv.a) {
    applicationRoutes = parseRoutes(argv.p);
  }

  fetch(
    key,
    viewId,
    {
      startDate: new Date(start),
      endDate: new Date(end)
    },
    r => r.replace('/app', ''),
    argv.a ? applicationRoutes.map(f => f.path) : []
  ).then(
    () => {
      console.log(chalk.green('Data processed successfully'));
    },
    e => {
      error(chalk.red(e));
    }
  );
}

if (isClusterize) {
  const viewId = argv.v;
  const total = argv.n;

  if (!viewId) {
    error('View id is mandatory');
  }
  if (!total) {
    error('Must specify number of bundles');
  }

  if (!argv.p) {
    error('For clusterization you need to provide a project');
  }

  dbStorage(viewId)
    .all()
    .then(g => {
      console.log(clusterize(g, parseInt(total), parseRoutes(argv.p)));
    });
}

if (isReport) {
  listen(argv.p || 3000);
}

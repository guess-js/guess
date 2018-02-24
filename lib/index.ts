import { dbStorage } from './store/store';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { fetch } from './fetch';
import { listen } from './report';

const argv = minimist(process.argv);

const o = (n: string) => chalk.yellow(n);
const c = (n: string) => chalk.blue(n);
const d = (n: string) => chalk.gray(n);
const error = (s: string) => console.error(chalk.red(s));

if (argv.h) {
  console.log(`
Welcome to Smarty!

${c('fetch')} ${o('-v')} ${o('[view_id]')} ${o('-c')} ${o('[credentials]')} ${o('-s')} ${o('[start_date]')} ${o(
    '-e'
  )} ${o('[end_date]')} ${d(`Fetches data from Google Analytics and stores it in levelgraph.
  Provide the view id of your page and credentials JSON file.`)}
${chalk.blue('report')} ${o('-p')} ${o('[port]')} ${d(
    `Starts a server which lets you explore the flow for given view.`
  )}
`);
  process.exit(0);
}

const isFetch = argv._.indexOf('fetch') >= 0;
const isReport = argv._.indexOf('report') >= 0;

if (isFetch && isReport) {
  error('You cannot fetch and report in the same time');
}

if (isFetch) {
  const key = require(argv.c);
  const viewId = argv.v;
  const start = argv.s;
  const end = argv.e;

  if (!viewId) {
    error('View id is mandatory');
    process.exit(0);
  }

  if (!start || !end) {
    error('Start and end dates are mandatory');
    process.exit(0);
  }

  fetch(key, viewId, {
    startDate: new Date(start),
    endDate: new Date(end)
  }).then(
    () => {
      console.log(chalk.green('Data processed successfully'));
    },
    e => {
      error(chalk.red(e));
    }
  );
}

if (isReport) {
  listen(argv.p || 3000);
}

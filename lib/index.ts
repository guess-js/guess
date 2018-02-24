import * as minimist from 'minimist';
import chalk from 'chalk';

import { fetch } from './fetch';

const argv = minimist(process.argv);

if (argv.h) {
  console.log(`
Welcome to Smarty!

${chalk.blue('fetch')} ${chalk.yellow('-v')} ${chalk.yellow.dim('[view_id]')} ${chalk.yellow('-c')} ${chalk.yellow.dim(
    '[credentials]'
  )} ${chalk.gray(`Fetches data from Google Analytics and stores it in levelgraph.
  Provide the view id of your page and credentials JSON file.`)}
${chalk.blue('report')} ${chalk.yellow('-v')} ${chalk.yellow.dim('[view_id]')} ${chalk.yellow('-f')} ${chalk.yellow.dim(
    '[format]'
  )} ${chalk.gray(`Produces report from already stored data in levelgraph.
  Provide view id and format. Available format HTML.`)}
`);
  process.exit(0);
}

const isFetch = argv._.indexOf('fetch') >= 0;
const isReport = argv._.indexOf('report') >= 0;

if (isFetch && isReport) {
  console.error('You cannot fetch and report in the same time');
}

if (isFetch) {
  const key = require(argv.c);
  const viewId = argv.v;

  if (!viewId) {
    console.error('View id is mandatory');
    process.exit(0);
  }
  fetch(key, viewId).then(
    () => {
      console.log(chalk.green('Data processed successfully'));
    },
    e => {
      console.error(chalk.red(e));
    }
  );
}

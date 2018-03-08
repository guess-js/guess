import { clusterize } from './ml/clusterize';
import { parseRoutes, RouteDefinition } from './parser/ng/index';
import { dbStorage, Graph } from './store/store';
import * as minimist from 'minimist';
import chalk from 'chalk';

import { fetch } from './ga';
import { listen } from './report';

import * as meow from 'meow';

const cli = meow(
  `Usage
$ smarty <options>

Options
--port, -p Port to serve the report to.

Examples
$ smarty 
  --port 11111
`,
  {
    flags: {
      port: {
        type: 'string',
        alias: 'p'
      }
    }
  }
);

listen(parseInt(cli.flags.port, 10) || 3000);

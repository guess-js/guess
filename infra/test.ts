import { join } from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';

const StaticServer = require('static-server');
const port = 5122;

function setupMockServer() {
  return new Promise(resolve => {
    const server = new StaticServer({
      rootPath: join(process.cwd(), 'packages', 'webpack', 'test', 'fixtures'),
      port
    });

    server.start(() => {
      console.log(chalk.yellow('Test server started on port', server.port));
      resolve(server);
    });
  });
}

async function main() {
  await setupMockServer();
  const watch = process.argv.filter(a => a === '--watch');
  const jest = spawn(`${process.cwd()}/node_modules/.bin/jest`, watch, { stdio: 'inherit' });
  return new Promise<number>(resolve => {
    jest.on('exit', code => resolve(code));
    jest.on('close', code => resolve(code));
  });
}

main().then(code => process.exit(code));

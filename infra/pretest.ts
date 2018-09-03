import { readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const cwd = process.cwd();
const base = join(cwd, 'packages', 'guess-webpack', 'test', 'fixtures');

readdirSync(base).forEach(dir => {
  if (dir === '.' || dir === '..') {
    return;
  }
  execSync(`cd ${join(base, dir)} && rm -rf dist && npm i && npm run build`);
});

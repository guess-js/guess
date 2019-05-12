import { join } from 'path';
import { execSync } from 'child_process';

const PackagesDir = join(process.cwd(), 'packages');
console.log(
  execSync(
    `cd ${join(PackagesDir, 'guess-parser', 'test', 'fixtures', 'angular')} && npm i`
  ).toString()
);

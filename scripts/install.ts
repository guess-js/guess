import { join } from 'path';
import { execSync } from 'child_process';

const Packages = ['ga', 'cluster', 'parser', 'webpack'];
const PackagesDir = join(process.cwd(), 'packages');
for (const p of Packages) {
  const path = join(PackagesDir, p);
  console.log(execSync(`cd ${path} && npm i`).toString());
}

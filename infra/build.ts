import * as fs from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import * as meow from 'meow';

const cli = meow(
  `Usage
$ npm run build -- <options>

Options
--publish, -p  Publish the packages to npm

Examples
$ npm run build -- --publish true
`,
  {
    flags: {
      publish: {
        type: 'boolean',
        alias: 'p'
      }
    }
  }
);

const Confirm = require('prompt-confirm');

const publish = (path: string) => {
  console.log(execSync(`cd ${path} && npm publish . --access public`).toString());
};

const packageNames = new Set(['guess-ga', 'guess-parser', 'guess-webpack']);

const build = (hook = (path: string) => {}) => {
  const Packages = ['ga', 'parser', 'webpack'];
  const PackagesDir = join(process.cwd(), 'packages');
  const config = JSON.parse(fs.readFileSync(join('config.json')).toString());

  for (const p of Packages) {
    const path = join(PackagesDir, p);
    console.log(execSync(`cd ${path} && rm -rf dist && ./node_modules/.bin/webpack`).toString());
    const packageJsonPath = join(path, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
    packageJson.version = config.version;

    const deps = packageJson.dependencies || {};
    Object.keys(deps).forEach(d => {
      if (packageNames.has(d)) {
        deps[d] = config.version;
      }
    });

    const readme = fs.readFileSync(join(path, 'README.md')).toString();

    const packageJsonReplacedContent = JSON.stringify(packageJson, null, 2);
    fs.writeFileSync(packageJsonPath, packageJsonReplacedContent);

    const publishPath = join(path, 'dist');
    fs.writeFileSync(join(publishPath, 'package.json'), packageJsonReplacedContent);
    fs.writeFileSync(join(publishPath, 'README.md'), readme);

    hook(publishPath);
  }
};

if (cli.flags.publish) {
  new Confirm('Are you sure you want to publish the packages?').ask(
    (answer: any) => (answer ? build(publish) : void 0)
  );
} else {
  build();
}

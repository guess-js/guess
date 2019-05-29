import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const enterTest = 'cd packages/guess-webpack/test/fixtures/angular';
execSync(`${enterTest} && npm i`);
execSync(
  `${enterTest} && ./node_modules/.bin/ng build --extra-webpack-config webpack.extra.js`
);

const fooModule = readFileSync('packages/guess-webpack/test/fixtures/angular/dist/angular/foo-foo-module.js').toString();
if (fooModule.indexOf('__GUESS__.p(["baz-baz-module.js",1]') < 0) {
  process.exit(1);
}

const mainModule = readFileSync('packages/guess-webpack/test/fixtures/angular/dist/angular/vendor.js').toString();
if (mainModule.indexOf('__GUESS__.p(') < 0 && mainModule.indexOf('__GUESS__.p=') < 0) {
  process.exit(1);
}

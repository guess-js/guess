import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const enterTest = 'cd packages/guess-webpack/test/fixtures/angular';
console.log(execSync(`${enterTest} && yarn`).toString());
console.log(execSync(
  `${enterTest} && ./node_modules/.bin/ng build --extra-webpack-config webpack.extra.js`
).toString());

// Prefetching instruction for baz
const fooModule = readFileSync('packages/guess-webpack/test/fixtures/angular/dist/angular/foo-foo-module.js').toString();
if (fooModule.indexOf(`__GUESS__.p(['baz-baz-module.js',1]`) < 0) {
  console.error('Cannot find prefetching instructions');
  process.exit(1);
}

// No prefetching instructions
const bazModule = readFileSync('packages/guess-webpack/test/fixtures/angular/dist/angular/baz-baz-module.js').toString();
if (bazModule.indexOf('__GUESS__') >= 0) {
  console.error('Found prefetching instructions in bundle with no neighbors');
  process.exit(1);
}

// No runtime
const mainModule = readFileSync('packages/guess-webpack/test/fixtures/angular/dist/angular/main.js').toString();
if (mainModule.indexOf('__GUESS__.p(') < 0 && mainModule.indexOf('__GUESS__.p=') < 0) {
  console.error('Unable to find runtime or initial prefetching instruction');
  process.exit(1);
}

// Prod build should work
console.log(execSync(
  `${enterTest} && ./node_modules/.bin/ng build --prod --extra-webpack-config webpack.extra.js`
).toString());

const webpack = require('webpack');

const common = {
  externals: [/^(@|\w).*$/i],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' },
      {
        test: /\.tpl$/,
        use: 'raw-loader'
      }
    ]
  }
};

module.exports = [
  Object.assign(
    {
      entry: {
        runtime: './runtime.ts'
      },
      target: 'web',
      output: {
        filename: 'runtime-code.js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'var',
        library: '__GUESS__'
      }
    },
    common
  ),
  Object.assign(
    {
      entry: {
        index: './index.ts'
      },
      output: {
        filename: '[name].js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'umd'
      },
      target: 'node',
      node: {
        __dirname: false,
        __filename: false
      }
    },
    common
  )
];

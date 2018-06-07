const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

const common = {
  mode: 'development',
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
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './src/runtime/runtime.tpl', to: 'runtime.tpl' },
      { from: './src/runtime/guess.tpl', to: 'guess.tpl' }
    ])
  ]
};

module.exports = [
  Object.assign(
    {
      entry: {
        runtime: './src/runtime/runtime.ts'
      },
      target: 'web',
      output: {
        filename: 'runtime.js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'umd'
      }
    },
    common
  ),
  Object.assign(
    {
      entry: {
        runtime: './src/runtime/guess.ts'
      },
      target: 'web',
      output: {
        filename: 'guess.js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'umd'
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
  ),
  Object.assign(
    {
      entry: {
        index: './src/api.ts'
      },
      output: {
        filename: '[name].js',
        path: __dirname + '/dist/api/',
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

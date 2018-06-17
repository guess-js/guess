const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const common = {
  mode: 'production',
  externals: [/^(@|\w).*$/i],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        logLevel: 'info',
        logInfoToStdOut: true
      })
    ]
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};

module.exports = [
  Object.assign(
    {
      entry: {
        runtime: './src/runtime/runtime.ts'
      },
      target: 'node',
      output: {
        filename: '[name].js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'commonjs'
      }
    },
    common
  ),
  Object.assign(
    {
      entry: {
        guess: './src/runtime/guess.ts'
      },
      target: 'node',
      output: {
        filename: '[name].js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'commonjs'
      }
    },
    common
  ),
  Object.assign(
    {
      entry: './index.ts',
      output: {
        filename: 'index.js',
        path: __dirname + '/dist/webpack/',
        libraryTarget: 'umd'
      },
      target: 'node',
      node: {
        __dirname: false,
        __filename: false
      },
      plugins: [
        new CopyWebpackPlugin([
          { from: './src/runtime/runtime.tpl', to: 'runtime.tpl' },
          { from: './src/runtime/guess.tpl', to: 'guess.tpl' }
        ])
      ]
    },
    common
  ),
  Object.assign(
    {
      entry: './src/api.ts',
      output: {
        filename: 'index.js',
        path: __dirname + '/dist/api/',
        libraryTarget: 'commonjs'
      },
      target: 'web',
      node: {
        __dirname: false,
        __filename: false
      }
    },
    common
  )
];

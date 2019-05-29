const CopyWebpackPlugin = require('copy-webpack-plugin');

const common = {
  mode: 'production',
  externals: [/^(@|\w{3}(?<!\w:\\)).*$/i],
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};

module.exports = [
  {
    mode: 'production',
    externals: [/^(@|\w{3}(?<!\w:\\)).*$/i],
    entry: `${__dirname}/api/index.ts`,
    output: {
      filename: 'api/index.js',
      path: __dirname,
      libraryTarget: 'commonjs'
    },
    target: 'web',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            // context: __dirname,
            configFile: 'tsconfig-api.json'
          }
        }
      ]
    }
  },
  Object.assign(
    {
      entry: {
        runtime: './src/runtime/runtime.ts'
      },
      target: 'node',
      output: {
        filename: '[name].js',
        path: __dirname + '/dist/guess-webpack/',
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
        path: __dirname + '/dist/guess-webpack/',
        libraryTarget: 'commonjs'
      }
    },
    common
  ),
  Object.assign(
    {
      entry: './index.ts',
      output: {
        filename: 'main.js',
        path: __dirname + '/dist/guess-webpack/',
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
  )
];

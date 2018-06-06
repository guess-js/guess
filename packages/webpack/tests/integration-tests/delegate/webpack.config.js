const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GuessPlugin } = require('../../../dist/webpack/index');

module.exports = {
  mode: 'development',
  entry: './index.js',
  target: 'node',
  output: {
    filename: './index.js',
    libraryTarget: 'umd'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.js']
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'index.html', to: 'index.html' }]),
    new GuessPlugin({
      delegate: true,
      routeProvider: false,
      reportProvider() {
        return {
          foo: {
            bar: 4
          }
        };
      }
    })
  ]
};

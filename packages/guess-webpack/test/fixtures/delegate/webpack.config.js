const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GuessPlugin } = require('../../../dist/guess-webpack/main');

module.exports = {
  mode: 'development',
  entry: './index.js',
  target: 'web',
  output: {
    filename: './index.js',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new CopyWebpackPlugin([{ from: 'index.html', to: 'index.html' }]),
    new GuessPlugin({
      runtime: {
        delegate: true,
      },
      routeProvider: false,
      reportProvider() {
        return Promise.resolve({
          foo: {
            bar: 4
          }
        });
      }
    })
  ]
};

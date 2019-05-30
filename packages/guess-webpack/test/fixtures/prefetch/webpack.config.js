const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { GuessPlugin } = require('../../../dist/guess-webpack/main');

const absolute = path => {
  return join(__dirname, path);
};

module.exports = [
  {
    mode: 'production',
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
          basePath: ''
        },
        routeProvider: () => {
          return [
            {
              path: '/home',
              modulePath: absolute('home.js'),
              parentModulePath: absolute('index.js'),
              lazy: true
            },
            {
              path: '/about',
              modulePath: absolute('about.js'),
              parentModulePath: absolute('index.js'),
              lazy: true
            },
            {
              path: '/contact',
              modulePath: absolute('contact.js'),
              parentModulePath: absolute('index.js'),
              lazy: true
            }
          ];
        },
        reportProvider() {
          return Promise.resolve({
            '/home': {
              '/about': 1
            },
            '/about': {
              '/contact': 1
            }
          });
        }
      })
    ]
  }
];

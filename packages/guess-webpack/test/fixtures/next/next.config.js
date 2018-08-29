const { GuessPlugin } = require('../../../dist/guess-webpack/main');

module.exports = {
  assetPrefix: '/next/dist',
  webpack: function(config, { isServer }) {
    if (isServer) return config;
    config.plugins.push(
      new GuessPlugin({
        reportProvider() {
          return Promise.resolve({
            '/next/dist/': {
              '/next/dist/contact': 80,
              '/next/dist/about': 20
            },
            '/next/dist/contact': {
              '/next/dist/': 20,
              '/next/dist/about': 80
            },
            '/next/dist/about': {
              '/next/dist/': 80,
              '/next/dist/contact': 20
            }
          });
        },
        runtime: {
          delegate: true,
          prefetchConfig: {
            '4g': 0.7,
            '3g': 0.7,
            '2g': 0.7,
            'slow-2g': 0.7
          }
        },
        routeProvider: false
      })
    );
    return config;
  }
};

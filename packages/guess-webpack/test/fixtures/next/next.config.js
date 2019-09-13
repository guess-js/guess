const { GuessPlugin } = require('../../../dist/guess-webpack/main');

module.exports = {
  assetPrefix: '/next/dist',
  webpack: function(config, { isServer }) {
    if (isServer) return config;
    config.plugins.push(
      new GuessPlugin({
        reportProvider() {
          return Promise.resolve({
            '/': {
              '/contact': 80,
              '/about': 20
            },
            '/contact': {
              '/': 20,
              '/about': 80
            },
            '/about': {
              '/': 80,
              '/contact': 20
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

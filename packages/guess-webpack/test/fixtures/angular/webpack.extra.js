const { GuessPlugin } = require('../../../');
const { parseRoutes } = require('../../../../guess-parser/');

module.exports = {
  plugins: [
    new GuessPlugin({
      debug: true,
      reportProvider() {
        return Promise.resolve(JSON.parse(require('fs').readFileSync('./routes.json').toString()));
      },
      runtime: {
        base: 'http://localhost:1337'
      },
      routeProvider() {
        return parseRoutes('.');
      }
    })
  ]
};

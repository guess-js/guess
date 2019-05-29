const { GuessPlugin } = require('../../../');
const { parseRoutes } = require('../../../../guess-parser/');

module.exports = {
  plugins: [
    new GuessPlugin({
      reportProvider() {
        return Promise.resolve(JSON.parse(require('fs').readFileSync('./routes.json').toString()));
      },
      routeProvider() {
        return parseRoutes('.');
      }
    })
  ]
};

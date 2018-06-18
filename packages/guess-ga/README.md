# GA

Fetches data from Google analytics.

## Usage

```bash
npm i guess-ga
```

Combined with `guess-parser` you can aggregate the route information and map it to your application's parametrized routes:

```ts
const { fetch } = require('guess-ga');
const { parseRoutes, ProjectType } = require('guess-parser');
const { writeFileSync } = require('fs');

const key = require('./credentials.json');
const viewId = '000000000';

const applicationRoutes = parseRoutes('tsconfig.app.json', ProjectType.Angular);

fetch({
  key,
  viewId,
  period: {
    startDate: new Date('2016-1-1'),
    endDate: new Date('2018-2-24')
  },
  formatter: r => r.replace('/app', ''),
  routes: applicationRoutes.map(f => f.path)
}).then(g => {
  writeFileSync('data.json', JSON.stringify(g, null, 2));
});
```

For more details visit [https://github.com/guess-js/guess](https://github.com/guess-js/guess).

## License

MIT

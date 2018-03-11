# GA

Allows you to fetch data from Google analytics. Combined with `@mlx/parser` you can aggregate the route information and map it to your application's parametrized routes:

```ts
const { fetch } = require('@mlx/ga');
const { parseRoutes, ProjectType } = require('@mlx/parser');
const { writeFileSync } = require('fs');

const key = require('./credentials.json');
const viewId = 'GA View Id';

const applicationRoutes = parseRoutes(
  '<Project Path>/tsconfig.json',
  ProjectType.Angular // or ProjectType.React
);

fetch(
  key,
  viewId,
  {
    startDate: new Date('2016-1-1'),
    endDate: new Date('2018-2-24')
  },
  r => r.replace('/app', ''),
  applicationRoutes.map(f => f.path)
).then(g => {
  writeFileSync('data.json', JSON.stringify(g, null, 2));
});
```

## License

MIT

# guess-webpack

This package exports the `GuessPlugin`

## Usage

This section introduces the configuration properties of the `GuessPlugin`

## Basic Usage

Import the `GuessPlugin`:

```ts
const { GuessPlugin } = require('guess-webpack');
```

Add the following snippet as last line in your webpack config file:

```ts
new GuessPlugin({ GA: 'GA_VIEW_ID' });
```

Where `GA_VIEW_ID` is the [Google Analytics view ID](https://support.google.com/analytics/answer/3123669). The `guess-ga` plugin will extract report from Google Analytics for the last year. For custom period look at the section below.

## Advanced Usage

In some cases `guess-parser` might not be able to detect your application type or it may fail to parse your application. You may also want to pass a custom time period:

```ts
new GuessPlugin({
  // View ID of the GA application
  GA: 'GA_VIEW_ID',

  // The mode provides hint to the `guess-parser` how your application
  // should be parsed in order to extract the routes and map them
  // to the pages gotten from GA.
  mode: 'create-react-app-typescript' | 'gatsby' | 'create-react-app' | 'angular-cli';

  // Provides further hints to the `guess-parser` on the structure of your application.
  layout: {
    typescript: '2.8.1',
    tsconfigPath: 'src/tsconfig.app.json',
    sourceDir: 'src'
  },

  // Specifies the GA report period.
  period: {
    startDate: new Date('mm/dd/yyyyy'),
    endDate: new Date('mm/dd/yyyyy'),
  },

  // Used for formatting/processing the routes
  // of your application. For example, this function adds a `app` prefix
  // to all of them.
  routeFormatter(path: string) {
    return 'app/' + path;
  },

  // Runs the plugin in `debug` mode.
  debug: true,

  // Specifies the base path used for fetching the application's bundles.
  // `prefetchConfig` specifies probability thresholds which allow the prefetching
  // algorithm to be more aggressive for users with faster connection
  // and less aggressive for users with slower connection.
  runtime: {
    basePath: '/foo/bar',
    prefetchConfig: {
      '4g': 0.15,
      '3g': 0.3,
      '2g': 0.45,
      'slow-2g': 0.6
    },
  },

  // In case the `guess-parser` is not able to parse your application
  // you can specify a custom parser. This function can also return a static
  // representation on your application, mapping routes to bundle entry points.
  routeProvider() {
    return parseApplication();
  }
})
```

## License

MIT

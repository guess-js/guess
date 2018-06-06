# guess-webpack

This package exports the `GuessPlugin`

## Quick start (webpack)

Install `GuessPlugin` - our webpack plugin:

```js
npm i guess-webpack --save-dev
```

Import `GuessPlugin` to your webpack config:

```js
const { GuessPlugin } = require('guess-webpack');
```

Add this to the end of your webpack config:

```js
new GuessPlugin({ GA: 'GOOGLE_ANALYTICS_VIEW_ID' });
```

## Usage

```bash
npm i guess-webpack --save-dev
```

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

Where `GA_VIEW_ID` is the [Google Analytics view ID](https://ga-dev-tools.appspot.com/query-explorer/). The `guess-ga` plugin will extract report from Google Analytics for the last year. For custom period look at the section below.

## Advanced Usage

In some cases `guess-parser` might not be able to detect your application type or it may fail to parse your application. When this happens, the package will throw errors for:

* Missing tsconfig for a React TSX or Angular project.
* Missing source directory for React JSX project.
* Unsupported project (i.e. if the project cannot be recognized or it doesn't match any of the supported types).

You may also want to pass a custom time period:

```ts
new GuessPlugin({
  // View ID of the GA application. Alternatively, you can use `reportProvider`
  // if you want to extract the report from the file system or a different source,
  // other than Google Analytics.
  GA: 'GA_VIEW_ID',

  // Custom report provider. It is used for providing reports from a different source
  // other than Google Analytics. Keep in mind that you cannot specify both
  // `GA` and `reportProvider`. If `GA` is specified, then Guess.js will use the default
  // Google Analytics report provider. For the format of the report, check the
  // "Custom report provider" section below.
  reportProvider() {
    return new Promise((resolve, reject) => {
      readFile('./report.json', (err, content) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(JSON.stringify(content.toString()));
      })
    });
  }

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
    // Does not prefetch bundles during route change.
    // Instead, the client library can use the `guess` method from `guess-webpack/api`
    // in order to grade the links with highest probability to be visited.
    // For details see "Manual Prefetching"
    delegate: true,

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
  //
  // In order to skip the metadata collection and use the raw GA report set
  // `routeProvider` to `false`.
  routeProvider() {
    return parseApplication();
  }
})
```

## Manual Prefetching

In case your application has manual prefetching logic, you can disable the prefetching that the `GuessPlugin` performs and instead only use the generated model.

For the purpose, apply the following configuration to the `GuessPlugin`:

```ts
GuessPlugin({
  runtime: {
    delegate: true
  }
});
```

During runtime, in your application use the `guess` function:

```ts
import { guess } from 'guess-webpack/api';

guess('/current/route', ['/link-1', '/link-2', '/unavailable']);
```

If you skip the second argument of `guess` you'll receive an exhaustive list of routes which could be requested next.

The `guess` function will return an object with keys the provided links and values the probability these links to be visited. For example, for the input above you can expect the following output:

```ts
{
  '/link-1': 0.3,
  '/link-2': 0.6
}
```

The `guess` function will not add values for the links it cannot find information for.

## Custom report provider

The `reportProvider` configuration property of `GuessPlugin` is a function which returns promise that resolves to the following data structure:

```ts
export interface PageTransitions {
  [key: string]: number;
}

export interface Report {
  [key: string]: PageTransitions;
}
```

Here's an example:

```ts
{
  "foo": {
    "bar": 5,
    "baz" 2
  },
  "bar": {
    "baz": 3
  }
}
```

The meaning of the report above is:

* There are two reported transitions from page `foo`:
  * Transition to page `bar` which has occurred 5 times.
  * Transition to page `baz` which has occurred 2 times.
* There's one reported transition from page `bar`:
  * Transition to `baz` which has occurred 3 times.

## Demos

A number of sample projects using `GuessPlugin` are available. These include:

* [Gatsby Guess Wikipedia](https://github.com/guess-js/gatsby-guess) - a Wikipedia client built using Gatsby.js (the React static-site framework) and Guess.js. This is the closest example we have of a real-world demo application built using the project.
* [`guess-js-react-demo`](https://github.com/mgechev/guess-js-react-demo) - a simple demo application using `GuessPlugin` and `create-react-app`
* [`guess-js-angular-demo`](https://github.com/mgechev/guess-js-angular-demo) - a simple demo application using `GuessPlugin` and Angular CLI

**Note:** Predictive fetching relies heavily on the availability of data in a Google Analytics account to drive predictions. You may need to seed some data for this by navigating around your demo project to provide Guess with some early data to guide what to prefetch.

## License

MIT

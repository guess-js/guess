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

Finally, in your application use Guess.js as follows:

```ts
import { guess } from 'guess-webpack/api';

guess();
/**
 {
   '/foo': 0.1,
   '/bar': 0.3,
   '/baz': 0.6
 }
 */
```

In the snippet above, we first import `guess` from `guess-webpack/api`. After that we invoke the `guess` function and it returns an object with keys pages in our application and values probabilities the user to visit the corresponding page.

This way, you can prefetch content associated with the pages which are likely to be visited on the next user navigation. There are plugins for popular frameworks which are going to do this for you! For examples look at the [demo section](#demos).

For further information on how to use `guess`, look at the "Advanced Usage" section below.

## Advanced Usage

The `guess` function allows you to specify a few optional parameters:

```ts
import { guess } from 'guess-webpack/api';

guess('/current/route', ['/link-1', '/link-2', '/unavailable']);
```

The first argument that we've passed to the function invocation above is a path. `guess` will return an object which contains the paths which are likely to be visited next from the path that we've specified. If we omit the first argument, `guess` will use `location.pathname`.

The second argument of `guess` is a whitelist of paths. The returned object from `guess` will contain only keys which are listed in this array.

If you skip the second argument of `guess` you'll receive an exhaustive list of routes which could be visited next.

### Automatic Prefetching

In case you're interested in automating the process of prefetching of bundles in your application, you can use the `guess-webpack` package together with `guess-parser`:

```ts
import { parseRoutes } from 'guess-parser';

GuessPlugin({
  GA: 'XXXXXX',
  routeProvider() {
    return parseRoutes('.');
  },
  runtime: {
    delegate: false
  }
});
```

At build time, the snippet above will first create mapping between paths and lazy-loaded JavaScript bundles. At runtime, while the user is navigating in the application a small runtime will invoke `guess` to make predictions for the pages which are likely to be visited next. At each step, Guess.js will pick the top paths and prefetch their corresponding bundles.

Keep in mind that `parseRoutes` might not be able to properly create the mapping between the routes and the bundles in applications with very dynamic route definition, for example most React and Vue applications are not supported. For further information on `guess-parser` look at the [package's documentation](https://github.com/guess-js/guess/tree/master/packages/guess-parser).

### Custom Route Provider

In case Guess.js cannot manage to parse the routes of your application and create mapping to the corresponding lazy-loaded bundles, you can provide a custom route provider. It should have the following type:

```ts
export type RouteProvider = () => Promise<RoutingModule[]>;
```

Where `RoutingModule` has the following interface:

```ts
export interface RoutingModule {
  path: string;
  modulePath: string;
  parentModulePath: string | null;
  lazy: boolean;
}
```

### Custom report provider

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

- There are two reported transitions from page `foo`:
  - Transition to page `bar` which has occurred 5 times.
  - Transition to page `baz` which has occurred 2 times.
- There's one reported transition from page `bar`:
  - Transition to `baz` which has occurred 3 times.

## Demos

A number of sample projects using `GuessPlugin` are available. These include:

- [Gatsby Guess Wikipedia](https://github.com/guess-js/gatsby-guess) - a Wikipedia client built using Gatsby.js (the React static-site framework) and Guess.js. This is the closest example we have of a real-world demo application built using the project.
- [`guess-js-react-demo`](https://github.com/mgechev/guess-js-react-demo) - a simple demo application using `GuessPlugin` and `create-react-app`
- [`guess-js-angular-demo`](https://github.com/mgechev/guess-js-angular-demo) - a simple demo application using `GuessPlugin` and Angular CLI
- [`guess-next`](https://github.com/mgechev/guess-next) - a sample application showing the integration between Next.js and Guess.js
- [`guess-nuxt`](https://github.com/daliborgogic/guess-nuxt) - a sample application showing the integration between Nuxt.js and Guess.js

**Note:** Predictive fetching relies heavily on the availability of data in a Google Analytics account to drive predictions. You may need to seed some data for this by navigating around your demo project to provide Guess with some early data to guide what to prefetch.

## License

MIT

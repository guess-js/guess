# guess-parser

This module is used for route extraction by the `GuessPlugin`. The module exports several functions:

## Usage

```bash
npm i guess-parser --save-dev
```

## API

* `detect(path: string)` - Detects the project type and returns metadata. For the currently supported projects see the `ProjectMetadata` interface.
* `parseRoutes(path: string)` - Extracts the routes of the application in `path`. Internally uses the `detect` function.
* `parseAngularRoutes(tsconfig: string)` - Extracts the routes of an Angular application. As arguments the function accepts path to the `tsconfig.json` file of the project.
* `parseReactJSXRoutes(path: string)` - Extracts the routes from React JSX project. See the supported syntax below.
* `parseReactTSXRoutes(tsconfig: string)` - Extracts the routes from React TypeScript projects which uses JSX by `tsconfig.json` file. See the supported syntax below.

```ts
export interface ProjectMetadata {
  type: ProjectType;
  version: string;
  details?: ProjectLayout;
}

export enum ProjectType {
  AngularCLI = 'angular-cli',
  CreateReactApp = 'create-react-app',
  Gatsby = 'gatsby',
  CreateReactAppTypeScript = 'create-react-app-typescript'
}

export interface ProjectLayout {
  typescript?: string;
  tsconfigPath?: string;
  sourceDir?: string;
}
```

## Supported Syntax

### Angular

Because of the produced summaries by the Angular compiler the Angular parser supports most Angular CLI applications as well as most starters.

### React

Because of the dynamic nature of React and lack of standard route definition syntax, only applications using the following convention can be successfully parsed:

```jsx
<Router history={history}>
  <div className="App">
    <Link to="/intro">Intro</Link>
    <Link to="/main">Main</Link>
    <div>
      <Switch>
        <Redirect exact={true} from="/" to="/intro" />
        <Route path="/intro" component={AsyncComponent(() => import('./intro/Intro'))} />
        <Route path="/main" component={Main} />
      </Switch>
    </div>
  </div>
</Router>
```

Currently, there are several important conventions:

* Support only for JSX syntax
* Support only for `react-router`-like syntax
* The path attribute of the `<Route/>` element must have value of type string literal.
* The lazy-loaded components should have dynamic import with the following structure of the AST:
  * `CallExpression` (e.g. `AsyncComponent`) with a single argument
  * The type of the argument should be an `ArrowFunction`
  * The arrow function should have an expression as body (e.g. `CallExpression`)
  * To the `CallExpression` should be passed a `StringLiteral` which points to the lazy-loaded module

**Contributions aiming to extend the supported syntax are very welcome!**

## License

MIT

import * as ts from 'typescript';
import { RoutingModule } from '../../../common/interfaces';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve, join } from 'path';
import {
  findMainModule,
  getLazyEntryPoints,
  getModuleEntryPoint,
  Registry,
  collectRoutingModules,
  findRootModule,
  cleanModuleCache
} from './modules';
import { LazyRoute, isRoute, getRoute, readChildren } from './routes';

export interface Options {
  redirects: boolean;
}

const defaultOptions: Options = {
  redirects: false,
};

const normalizeOptions = (options: Partial<Options>) => ({
  ...defaultOptions,
  ...options,
});

export const parseRoutes = (
  tsconfig: string,
  exclude: string[] = [],
  inputOptions: Partial<Options> = {}
): RoutingModule[] => {

  const options = normalizeOptions(inputOptions);
  cleanModuleCache();
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true
  };
  const config = ts.readConfigFile(tsconfig, path =>
    readFileSync(path).toString()
  );
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    parseConfigHost,
    resolve(dirname(tsconfig)),
    {
      noEmit: true
    }
  );

  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();

  const toAbsolute = (file: string) =>
    file.startsWith('/') || file.startsWith(process.cwd()) ? file : join(process.cwd(), file);
  const excludeFiles = new Set<string>(exclude.map(toAbsolute));

  const visitTopLevelRoutes = (
    s: ts.SourceFile,
    callback: (routeObj: ts.Node) => void,
    n: ts.Node
  ) => {
    if (excludeFiles.has(resolve(s.fileName))) {
      return;
    }
    if (!n) {
      return;
    }
    if (isRoute(n, typeChecker, options.redirects)) {
      callback(n);
    } else {
      n.forEachChild(visitTopLevelRoutes.bind(null, s, callback));
    }
  };

  const mainPath = findMainModule(program);
  if (!mainPath) {
    throw new Error('Cannot find the main application module');
  }

  const entryPoints: Set<string> = new Set([mainPath]);
  const collectEntryPoints = (n: ts.Node) => {
    const path = getLazyEntryPoints(
      n as ts.ObjectLiteralExpression,
      program,
      host
    );
    if (!path) {
      const childrenArray = readChildren(n as ts.ObjectLiteralExpression);
      if (childrenArray) {
        childrenArray.forEach(collectEntryPoints);
      }
      return;
    }
    entryPoints.add(path);
  };
  program.getSourceFiles().map(s => {
    s.forEachChild(
      visitTopLevelRoutes.bind(null, s, collectEntryPoints)
    );
  });

  const registry: Registry = {};

  program.getSourceFiles().map(s => {
    s.forEachChild(
      visitTopLevelRoutes.bind(null, s, (n: ts.Node) => {
        const path = resolve(n.getSourceFile().fileName);
        const route = getRoute(
          n as ts.ObjectLiteralExpression,
          entryPoints,
          program,
          host
        );
        if (!route) {
          return;
        }

        const modulePath = getModuleEntryPoint(path, entryPoints, program, host);
        const current = registry[modulePath] || {
          lazyRoutes: [],
          eagerRoutes: []
        };
        if ((route as LazyRoute).module) {
          current.lazyRoutes.push(route as LazyRoute);
        } else {
          current.eagerRoutes.push(route);
        }
        registry[modulePath] = current;
      })
    );
  });

  const result: RoutingModule[] = [];
  if (Object.keys(registry).length > 0) {
    collectRoutingModules(findRootModule(registry), registry, result);
  }

  return result;
};

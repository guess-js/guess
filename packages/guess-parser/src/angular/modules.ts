import * as ts from 'typescript';
import { resolve, join, dirname, sep } from 'path';
import { existsSync } from 'fs';
import { LazyRoute, Route, readLoadChildren } from './routes';
import { RoutingModule } from '../../../common/interfaces';


interface RoutesDeclaration {
  lazyRoutes: LazyRoute[];
  eagerRoutes: Route[];
}

export interface Registry {
  [path: string]: RoutesDeclaration;
}

export const findRootModule = (registry: Registry): string => {
  const childModules = new Set<string>();
  const traverseRoute = (route: Route) => {
    if ((route as LazyRoute).module) {
      childModules.add((route as LazyRoute).module);
    }
    route.children.forEach(traverseRoute);
  };
  const allModulePaths = Object.keys(registry);
  allModulePaths.forEach(path => {
    const declaration = registry[path];
    // It's possible if the declaration does not exist
    // See https://github.com/guess-js/guess/issues/311
    if (declaration) {
      declaration.eagerRoutes.forEach(traverseRoute);
      declaration.lazyRoutes.forEach(traverseRoute);
    }
  });
  const roots = allModulePaths.filter(m => !childModules.has(m));
  if (roots.length > 1) {
    throw new Error('Multiple root routing modules found ' + roots.join(', '));
  }
  return roots[0];
};

export const collectRoutingModules = (
  rootFile: string,
  registry: Registry,
  result: RoutingModule[],
  parentFilePath: string = rootFile,
  currentRoutePath: string = '',
  existing = new Set<string>()
) => {
  const declaration = registry[rootFile];

  // It's possible if the declaration does not exist
  // See https://github.com/guess-js/guess/issues/311
  if (!declaration) {
    return;
  }

  const process = (r: Route, routePath = currentRoutePath) => {
    if ((r as LazyRoute).module) {
      // tslint:disable-next-line: no-use-before-declare
      return processLazyRoute(r as LazyRoute, routePath);
    }
    // tslint:disable-next-line: no-use-before-declare
    return processRoute(r, routePath);
  };

  const processRoute = (r: Route, routePath = currentRoutePath) => {
    const path = (routePath + '/' + r.path).replace(/\/$/, '');
    r.children.forEach(route => process(route, path));
    if (!existing.has(path)) {
      const routingModule: RoutingModule = {
        path,
        lazy: parentFilePath !== rootFile && r.redirectTo === undefined,
        modulePath: rootFile,
        parentModulePath: parentFilePath,
      };
      if (r.redirectTo !== undefined) {
        routingModule.redirectTo = r.redirectTo;
      }
      result.push(routingModule);
      existing.add(path);
    }
  };

  const processLazyRoute = (r: LazyRoute, routePath = currentRoutePath) => {
    const path = (routePath + '/' + r.path).replace(/\/$/, '');
    r.children.forEach(route => process(route, path));
    collectRoutingModules(r.module, registry, result, rootFile, path);
  };

  declaration.eagerRoutes.forEach(r => processRoute(r));
  declaration.lazyRoutes.forEach(r => processLazyRoute(r));
};

export const findMainModule = (program: ts.Program) => {
  const tryFindMainModule = (n: ts.Node, sf: ts.SourceFile) => {
    if (
      n.kind === ts.SyntaxKind.Identifier &&
      (n as ts.Identifier).text === 'bootstrapModule'
    ) {
      const propAccess = (n as ts.Identifier).parent;
      if (
        !propAccess ||
        propAccess.kind !== ts.SyntaxKind.PropertyAccessExpression
      ) {
        return null;
      }
      const tempExpr = propAccess.parent;
      if (!tempExpr || tempExpr.kind !== ts.SyntaxKind.CallExpression) {
        return null;
      }
      const expr = tempExpr as ts.CallExpression;
      const module = expr.arguments[0];
      const tc = program.getTypeChecker();
      const symbol = tc.getTypeAtLocation(module).getSymbol();
      if (!symbol) {
        return null;
      }
      const decl = symbol.getDeclarations();
      if (!decl) {
        return null;
      }
      return resolve(decl[0].getSourceFile().fileName);
    }
    let mainPath: null | string = null;
    n.forEachChild(c => {
      if (mainPath) {
        return mainPath;
      }
      mainPath = tryFindMainModule(c, sf);
    });
    return mainPath;
  };
  return program.getSourceFiles().reduce((a, sf) => {
    if (a) {
      return a;
    }
    let mainPath: null | string = null;
    sf.forEachChild(n => {
      if (mainPath) {
        return;
      }
      mainPath = tryFindMainModule(n, sf);
    });
    return mainPath;
  }, null);
};

const isImportDeclaration = (node: ts.Node): node is ts.ImportDeclaration => {
  return node.kind === ts.SyntaxKind.ImportDeclaration;
};

const isReExportDeclaration = (node: ts.Node): node is ts.ExportDeclaration => {
  return (node.kind === ts.SyntaxKind.ExportDeclaration && (node as ts.ExportDeclaration).exportClause === undefined);
};

const normalizeFilePath = (path: string): string => {
  return join(...path.split(/\//).map((part, index) => (part === '' && index === 0) ? sep : part));
};

export const getModulePathFromRoute = (parentPath: string, loadChildren: string, program: ts.Program, host: ts.CompilerHost) => {
  const childModule = loadChildren.split('#')[0];
  const { resolvedModule } = ts.resolveModuleName(childModule, parentPath, program.getCompilerOptions(), host);
  if (resolvedModule) {
    return normalizeFilePath(resolvedModule.resolvedFileName);
  }
  const childModuleFile = childModule + '.ts';
  const parentSegments = dirname(parentPath).split(sep);
  const childSegments = childModuleFile.split('/');
  const max = Math.min(parentSegments.length, childSegments.length);
  let maxCommon = 0;
  for (let i = 1; i < max; i += 1) {
    for (let j = 0; j < i; j += 1) {
      let common = 0;
      if (parentSegments[parentSegments.length - 1 - j] === childSegments[j]) {
        common++;
        maxCommon = Math.max(maxCommon, common);
      } else {
        // breaking here
        common = 0;
        j = i;
      }
    }
  }

  const path = join(
    dirname(parentPath),
    childModuleFile
      .split('/')
      .slice(maxCommon, childSegments.length)
      .join('/')
  );

  // This early failure provides better error message compared to the
  // generic "Multiple root routing modules" error.
  if (!existsSync(path)) {
    throw new Error(`The relative path "${loadChildren}" to "${parentPath}" cannot be resolved to a module`);
  }
  return path;
};

const imports = (
  parent: string,
  child: string,
  program: ts.Program,
  host: ts.CompilerHost,
  importCache: {[parent: string]: {[child: string]: boolean}},
  visited: { [key: string]: boolean } = {}
) => {
  if (importCache[parent] && importCache[parent][child] !== undefined) {
    return importCache[parent][child];
  }
  importCache[parent] = importCache[parent] || {};
  const sf = program.getSourceFile(parent);
  if (!sf) {
    importCache[parent][child] = false;
    return false;
  }
  if (visited[parent]) {
    importCache[parent][child] = false;
    return false;
  }
  visited[parent] = true;
  let found = false;
  sf.forEachChild(n => {
    if (found) {
      return;
    }
    if (!isImportDeclaration(n) && !isReExportDeclaration(n)) {
      return;
    }
    const path = (n.moduleSpecifier as ts.StringLiteral).text;
    const { resolvedModule } = ts.resolveModuleName(path, parent, program.getCompilerOptions(), host);
    if (resolvedModule === undefined) {
      return;
    }

    const fullPath = normalizeFilePath(resolvedModule.resolvedFileName);
    if (fullPath === child) {
      found = true;
    }
    // We don't want to dig into node_modules to find an entry point.
    if (!found && existsSync(fullPath) && !fullPath.includes('node_modules')) {
      found = imports(fullPath, child, program, host, importCache, visited);
    }
  });
  importCache[parent][child] = found;
  return found;
};


let cache: { [parent: string]: { [child: string]: boolean } } = {};

export const cleanModuleCache = () => (cache = {});

// This can potentially break if there's a lazy module
// that is not only loaded lazily but also imported
// inside of a parent module.
//
// For example, `app.module.ts` lazily loads `bar.module.ts`
// in the same time `app.module.ts` imports `bar.module.ts`
// this way the module entry point will be `app.module.ts`.
export const getModuleEntryPoint = (
  path: string,
  entryPoints: Set<string>,
  program: ts.Program,
  host: ts.CompilerHost
): string => {
  const parents = [...entryPoints].filter(e => imports(e, path, program, host, cache));
  // If no parents, this could be the root module
  if (parents.length === 0) {
    return path;
  }
  if (parents.length > 1) {
    throw new Error(
      `Module ${path} belongs to more than one module: ${parents.join(', ')}`
    );
  }
  return parents[0];
};

export const getLazyEntryPoints = (
  node: ts.ObjectLiteralExpression,
  program: ts.Program,
  host: ts.CompilerHost
) => {
  const value = readLoadChildren(node, program.getTypeChecker());
  if (!value) {
    return null;
  }

  const parent = resolve(node.getSourceFile().fileName);
  const module = getModulePathFromRoute(parent, value, program, host);
  return module;
};

import * as ts from 'typescript';
import { RoutingModule } from '../../../common/interfaces';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve, join } from 'path';

const getObjectProp = (node: ts.ObjectLiteralExpression, prop: string): ts.Expression | null => {
  const vals = node.properties.values();
  for (const val of vals) {
    if (val.kind !== ts.SyntaxKind.PropertyAssignment) {
      continue;
    }
    const value = val as ts.PropertyAssignment;
    if (value.name.kind !== ts.SyntaxKind.Identifier) {
      continue;
    }
    const name = value.name.text;
    if (name === prop) {
      return value.initializer;
    }
  }
  return null;
};

const readLoadChildren = (node: ts.ObjectLiteralExpression): string | null => {
  const expr = getObjectProp(node, 'loadChildren');
  if (!expr) {
    return null;
  }
  if (expr.kind === ts.SyntaxKind.StringLiteral) {
    return (expr as ts.StringLiteral).text;
  }
  let result: string | null = null;
  const visitor = (n: ts.Node) => {
    if (n.kind === ts.SyntaxKind.ImportKeyword) {
      const parent = n.parent as ts.CallExpression;
      const arg = parent.arguments[0];
      if (arg.kind === ts.SyntaxKind.StringLiteral) {
        result = (arg as ts.StringLiteral).text;
      }
    }
    if (result) {
      return;
    }
    n.forEachChild(visitor);
  };
  expr.forEachChild(visitor);
  return result;
};

const imports = (parent: string, child: string, program: ts.Program) => {
  const sf = program.getSourceFile(parent);
  if (!sf) {
    throw new Error('Cannot find source file for path: ' + parent);
  }
  let found = false;
  sf.forEachChild(n => {
    if (found) {
      return;
    }
    if (n.kind !== ts.SyntaxKind.ImportDeclaration) {
      return;
    }
    const imprt = n as ts.ImportDeclaration;
    const path = (imprt.moduleSpecifier as ts.StringLiteral).text;
    const fullPath = join(dirname(parent), path) + '.ts';
    if (fullPath === child) {
      found = true;
    }
    if (!found && existsSync(fullPath)) {
      found = imports(fullPath, child, program);
    }
  });
  return found;
};

const getModuleEntryPoint = (
  path: string,
  entryPoints: Set<string>,
  program: ts.Program
): string => {
  const parents = [...entryPoints].filter(e => imports(e, path, program));
  if (parents.length === 0) {
    throw new Error('Cannot find the entry point for ' + path);
  }
  if (parents.length > 1) {
    throw new Error(`Module ${path} belongs to more than one module: ${parents.join(', ')}`);
  }
  return parents[0];
};

const getLazyRoute = (
  node: ts.ObjectLiteralExpression,
  entryPoints: Set<string>,
  program: ts.Program
): RoutingModule | null => {
  const result = { lazy: true, modulePath: '', parentModulePath: '', path: '' };

  const path = getObjectProp(node, 'path');
  if (path === null) {
    return null;
  }
  if (path.kind !== ts.SyntaxKind.StringLiteral) {
    return null;
  }
  result.path = (path as ts.StringLiteral).text;

  const loadChildren = readLoadChildren(node);
  const component = getObjectProp(node, 'component');
  if (!component && !loadChildren) {
    return null;
  }

  if (loadChildren) {
    const parent = node.getSourceFile().fileName;
    const module = join(dirname(parent), loadChildren.split('#')[0] + '.ts');
    result.parentModulePath = getModuleEntryPoint(parent, entryPoints, program);
    result.modulePath = module;
    result.lazy = true;
  }

  if (component) {
    result.lazy = false;
    const entry = getModuleEntryPoint(node.getSourceFile().fileName, entryPoints, program);
    result.parentModulePath = entry;
    result.modulePath = entry;
  }

  return result;
};

const getLazyEntryPoints = (node: ts.ObjectLiteralExpression) => {
  const value = readLoadChildren(node);
  if (!value) {
    return null;
  }

  const parent = node.getSourceFile().fileName;
  const module = join(dirname(parent), value.split('#')[0] + '.ts');
  return module;
};

const isRouterLike = (n: ts.Node): boolean => {
  if (n.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
    return false;
  }
  const node = n as ts.ObjectLiteralExpression;
  const keys = node.properties.values();
  let flags = 0;
  for (const key of keys) {
    if (!key.name) {
      continue;
    }
    if (key.name.getText() === 'path') {
      flags |= 1;
    }
    if (key.name.getText() === 'loadChildren' || key.name.getText() === 'component') {
      flags |= 2;
    }
    if (flags === 3) {
      return true;
    }
  }
  return false;
};

const findMainModule = (program: ts.Program) => {
  const tryFindMainModule = (n: ts.Node, sf: ts.SourceFile) => {
    if (n.kind === ts.SyntaxKind.Identifier && (n as ts.Identifier).text === 'bootstrapModule') {
      const propAccess = (n as ts.Identifier).parent;
      if (!propAccess || propAccess.kind !== ts.SyntaxKind.PropertyAccessExpression) {
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
      return decl[0].getSourceFile().fileName;
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

export const parseRoutes = (tsconfig: string): RoutingModule[] => {
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true
  };
  const config = ts.readConfigFile(tsconfig, path => readFileSync(path).toString());
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
  const routes: RoutingModule[] = [];

  const visitNode = (s: ts.SourceFile, callback: (routeObj: ts.Node) => void, n: ts.Node) => {
    if (!n) {
      return;
    }
    n.forEachChild(visitNode.bind(null, s, callback));
    if (!isRouterLike(n)) {
      return;
    }
    callback(n);
  };

  const mainPath = findMainModule(program);
  if (!mainPath) {
    throw new Error('Cannot find the main application module');
  }

  const entryPoints: Set<string> = new Set([mainPath]);
  program.getSourceFiles().map(s => {
    s.forEachChild(
      visitNode.bind(null, s, (n: ts.Node) => {
        const path = getLazyEntryPoints(n as ts.ObjectLiteralExpression);
        if (!path) {
          return;
        }
        entryPoints.add(path);
      })
    );
  });

  program.getSourceFiles().map(s => {
    s.forEachChild(
      visitNode.bind(null, s, (n: ts.Node) => {
        const route = getLazyRoute(n as ts.ObjectLiteralExpression, entryPoints, program);
        if (!route) {
          return;
        }
        routes.push(route);
      })
    );
  });

  const moduleToRoute: { [key: string]: RoutingModule } = {};
  const parentToModule: { [key: string]: RoutingModule } = {};
  for (const route of routes) {
    if (!route.parentModulePath || !route.lazy) {
      continue;
    }
    if (route.lazy) {
      moduleToRoute[route.modulePath] = route;
    }
    parentToModule[route.parentModulePath] = route;
  }

  let routingModuleRoot: null | string = null;
  for (const route of routes) {
    if (moduleToRoute[route.modulePath]) {
      // this is the root module
      routingModuleRoot = route.modulePath;
      break;
    }
  }

  for (const route of routes) {
    if (!route.parentModulePath) {
      continue;
    }
    const path = [route.path];
    let parent: RoutingModule | null = moduleToRoute[route.parentModulePath];
    do {
      if (!parent) {
        continue;
      }
      path.unshift(parent.path);
      if (parent.parentModulePath) {
        parent = moduleToRoute[parent.parentModulePath];
      }
    } while (parent && parent.parentModulePath);
    route.path = path
      .join('/')
      .replace(/\/\//g, '/')
      .replace(/\/$/, '');
  }
  return routes;
};

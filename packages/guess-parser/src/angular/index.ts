import * as ts from 'typescript';
import { RoutingModule } from '../../../common/interfaces';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve, join } from 'path';

const getLazyRoute = (node: ts.ObjectLiteralExpression): RoutingModule => {
  const vals = node.properties.values();
  const result = { lazy: true, modulePath: '', parentModulePath: '', path: '' };
  for (const val of vals) {
    if (val.kind !== ts.SyntaxKind.PropertyAssignment) {
      continue;
    }
    const value = val as ts.PropertyAssignment;
    if (value.name.kind !== ts.SyntaxKind.Identifier) {
      continue;
    }
    const name = value.name.text;
    const init = (value.initializer as ts.StringLiteral).text;
    if (name === 'path') {
      result.path = init;
    }
    if (name === 'loadChildren') {
      if (value.initializer.kind !== ts.SyntaxKind.StringLiteral) {
        continue;
      }
      const parent = node.getSourceFile().fileName;
      const module = join(dirname(parent), init.split('#')[0] + '.ts');
      result.parentModulePath = parent;
      result.modulePath = module;
    }
    if (name === 'component') {
      result.lazy = false;
      result.parentModulePath = node.getSourceFile().fileName;
      result.modulePath = node.getSourceFile().fileName;
    }
  }
  return result;
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

  const visitNode = (s: ts.SourceFile, n: ts.Node) => {
    if (!n) {
      return;
    }
    n.forEachChild(visitNode.bind(null, s));
    if (!isRouterLike(n)) {
      return;
    }
    const route = getLazyRoute(n as ts.ObjectLiteralExpression);
    if (!route) {
      return;
    }
    routes.push(route);
  };
  program.getSourceFiles().map(s => {
    s.forEachChild(visitNode.bind(null, s));
  });
  const moduleToPath: { [key: string]: RoutingModule } = {};
  for (const route of routes) {
    if (!route.parentModulePath || !route.lazy) {
      continue;
    }
    moduleToPath[route.modulePath] = route;
  }
  console.log(JSON.stringify(moduleToPath, null, 2));
  for (const route of routes) {
    if (!route.parentModulePath) {
      continue;
    }
    const path = [route.path];
    let parent: RoutingModule | null = moduleToPath[route.parentModulePath];
    do {
      if (!parent) {
        continue;
      }
      path.unshift(parent.path);
      if (parent.parentModulePath) {
        parent = moduleToPath[parent.parentModulePath];
      }
    } while (parent && parent.parentModulePath);
    route.path = path
      .join('/')
      .replace(/\/\//g, '/')
      .replace(/\/$/, '');
  }
  return routes;
};

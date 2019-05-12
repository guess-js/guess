import * as ts from 'typescript';
import { RoutingModule } from '../../../common/interfaces';
import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';

const getRoute = (node: ts.ObjectLiteralExpression): RoutingModule => {
  const keys = node.properties.keys();
  for (const key of keys) {
    if (key.toString() === 'name') {
      console.log('#############');
    }
  }
  return {lazy: true, modulePath: '', parentModulePath: '', path: ''};
};

export const parseRoutes = (base: string): RoutingModule[] => {
  base = dirname(base);
  const tsconfig = ts.findConfigFile(base, existsSync);
  if (!tsconfig) {
    throw new Error('Cannot find the tsconfig.json file');
  }

  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: existsSync,
    readDirectory: ts.sys.readDirectory,
    readFile: file => readFileSync(file, 'utf8'),
    useCaseSensitiveFileNames: true
  }
  const config = ts.readConfigFile(tsconfig, path => readFileSync(path).toString());
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    parseConfigHost,
    resolve(base),
    {noEmit: true}
  )

  const host = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(parsed.fileNames, parsed.options, host);
  const typeChecker = program.getTypeChecker();
  const routes: RoutingModule[] = [];
  program.getSourceFiles().map(s => {
    s.forEachChild(n => {
      const type = typeChecker.getTypeAtLocation(n);
      const symbol = type.getSymbol();
      if (!symbol || symbol.getName() !== 'Route') {
        return;
      }
      const route = getRoute(n as ts.ObjectLiteralExpression);
      if (!route) {
        return;
      }
      routes.push(route);
    });
  });
  return routes;
};

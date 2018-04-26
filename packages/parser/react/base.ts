import { readFileSync } from 'fs';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { RoutingModule } from '../../common/interfaces';

const extractRoutes = (file: ts.SourceFile): RoutingModule[] => {
  const result: RoutingModule[] = [];
  const stack: ts.Node[] = [file];

  const extractModule = (a: ts.JsxAttribute) => {
    const init = a.initializer as ts.JsxExpression | null;
    if (!init) {
      return null;
    }
    const expr = init.expression as ts.CallExpression | null;
    if (!expr) {
      return '';
    }
    if (!expr.arguments) {
      return '';
    }
    const arrow = expr.arguments[0] as ts.ArrowFunction | null;
    if (!arrow) {
      return '';
    }
    const body = arrow.body as ts.CallExpression;
    if (!body) {
      return '';
    }
    const arg = body.arguments[0];
    if (!arg || arg.kind !== ts.SyntaxKind.StringLiteral) {
      return '';
    }
    return (arg as ts.StringLiteral).text;
  };

  while (stack.length) {
    const c = stack.pop();
    if (!c) {
      return result;
    }
    if (c.kind === ts.SyntaxKind.JsxElement || c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
      let el: ts.JsxSelfClosingElement | ts.JsxOpeningElement = (c as ts.JsxElement).openingElement;
      if (c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
        el = c as ts.JsxSelfClosingElement;
      }
      if ((el.tagName as ts.Identifier).text === 'Route') {
        const module: Partial<RoutingModule> = {
          lazy: false,
          parentModulePath: file.fileName,
          modulePath: file.fileName
        };
        el.attributes.properties.forEach(p => {
          const { text } = p.name as ts.Identifier;
          if (text === 'path') {
            module.path = ((p as ts.JsxAttribute).initializer as ts.StringLiteral).text;
          }
          if (text === 'component') {
            const parts = file.fileName.split('/');
            parts.pop();
            const tempName = extractModule(p as ts.JsxAttribute);
            if (tempName) {
              const name = tempName + '.tsx';
              module.modulePath = '/' + path.join(...parts.concat([name]));
              module.lazy = true;
            }
          }
          result.push(module as RoutingModule);
        });
      }
    }
    c.getChildren(file).forEach(child => {
      stack.push(child);
    });
  }
  return result;
};

export const parseReactRoutes = (files: string[], options: ts.CompilerOptions) => {
  const program = ts.createProgram(files, options);
  const jsxFiles = program.getSourceFiles().filter(f => f.fileName.endsWith('.tsx') || f.fileName.endsWith('.jsx'));
  const routes = jsxFiles.reduce((a, f) => a.concat(extractRoutes(f)), [] as RoutingModule[]);
  const modules = routes.reduce(
    (a, r) => {
      a[r.modulePath] = true;
      return a;
    },
    {} as { [key: string]: boolean }
  );
  const rootModule = routes.filter(r => r.parentModulePath && !modules[r.parentModulePath]).pop();
  if (rootModule) {
    routes.push({
      path: '/',
      parentModulePath: null,
      modulePath: rootModule.parentModulePath,
      lazy: false
    } as RoutingModule);
  }
  const routeMap = routes.reduce(
    (a, m) => {
      a[m.path] = m;
      return a;
    },
    {} as { [key: string]: RoutingModule }
  );
  return Object.keys(routeMap).map(k => routeMap[k]);
};

import { readFileSync } from 'fs';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { RoutingModule } from '../../../common/interfaces';
import { readFiles } from '../utils';
import { getLanguageService } from '../language-service';

const LazyRe = /routes\/((\w+\/index)|\w+)\.(js|jsx|ts|tsx)$/;

const getLazyDefinition = (
  filename: string,
  identifier: ts.Node,
  ls: ts.LanguageService
): ts.DefinitionInfo | undefined => {
  const defs = ls.getDefinitionAtPosition(filename, identifier.pos + 1);
  return defs.filter(d => LazyRe.test(d.fileName) && d.kind === 'class').pop();
};

const extractModule = (a: ts.JsxAttribute) => {
  const init = a.initializer as ts.JsxExpression | null;
  if (!init) {
    return null;
  }
  const arrow = init.expression as ts.ArrowFunction | null;
  if (!arrow) {
    return '';
  }
  const body = arrow.body as ts.CallExpression | null;
  if (!body) {
    return '';
  }
  const temp = body.expression as ts.CallExpression | null;
  if (!temp) {
    return '';
  }
  const internalExpr = temp.expression as ts.CallExpression | null;
  if (!internalExpr) {
    return '';
  }
  const arg = internalExpr.arguments[0] as ts.StringLiteral | null;
  if (!arg || arg.kind !== ts.SyntaxKind.StringLiteral) {
    return '';
  }
  return (arg as ts.StringLiteral).text;
};

const extractRoute = (c: ts.Node, file: ts.SourceFile, ls: ts.LanguageService) => {
  if (c.kind !== ts.SyntaxKind.JsxElement && c.kind !== ts.SyntaxKind.JsxSelfClosingElement) {
    return;
  }
  let el: ts.JsxSelfClosingElement | ts.JsxOpeningElement = (c as ts.JsxElement).openingElement;
  if (c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
    el = c as ts.JsxSelfClosingElement;
  }

  const module: Partial<RoutingModule> = {
    lazy: (el.tagName as ts.Identifier).text === 'AsyncRoute',
    parentModulePath: file.fileName,
    modulePath: file.fileName
  };
  const def = getLazyDefinition(file.getSourceFile().fileName, el, ls);
  if (def) {
    module.lazy = true;
    module.modulePath = def.fileName;
  }
  el.attributes.properties.forEach(p => {
    const { text } = p.name as ts.Identifier;
    if (text === 'path') {
      module.path = ((p as ts.JsxAttribute).initializer as ts.StringLiteral).text;
    }
    if (text === 'getComponent') {
      const parts = file.fileName.split('/');
      parts.pop();
      const tempName = extractModule(p as ts.JsxAttribute);
      if (tempName) {
        const name = tempName + '.tsx';
        module.modulePath = '/' + path.join(...parts.concat([name]));
        module.lazy = true;
      }
    }
  });
  return module as RoutingModule;
};

const extractRoutes = (file: ts.SourceFile, ls: ts.LanguageService): RoutingModule[] => {
  const result: RoutingModule[] = [];
  const stack: ts.Node[] = [file];

  while (stack.length) {
    const c = stack.pop();
    if (!c) {
      return result;
    }
    const el: ts.JsxSelfClosingElement | ts.JsxOpeningElement = (c as ts.JsxElement).openingElement;
    if (c.kind === ts.SyntaxKind.JsxElement && (el.tagName as ts.Identifier).text === 'Router') {
      (c as ts.JsxElement).children.forEach((e: ts.Node) => {
        const route = extractRoute(e, file, ls);
        if (route) {
          result.push(route);
        }
      });
    } else {
      c.getChildren(file).forEach(child => stack.push(child));
    }
  }
  return result;
};

export const parsePreactJSXRoutes = (base: string): RoutingModule[] => {
  const options = {
    jsx: ts.JsxEmit.React,
    allowJs: true
  };
  const rootFileNames = readFiles(base);
  const program = ts.createProgram(rootFileNames, options);
  const jsxFiles = program
    .getSourceFiles()
    .filter(f => f.fileName.endsWith('.tsx') || f.fileName.endsWith('.jsx') || f.fileName.endsWith('.js'));

  const routes = jsxFiles.reduce(
    (a, f) => a.concat(extractRoutes(f, getLanguageService(rootFileNames, options))),
    [] as RoutingModule[]
  );

  const routeMap = routes.reduce(
    (a, m) => {
      a[m.path] = m;
      return a;
    },
    {} as { [key: string]: RoutingModule }
  );
  return Object.keys(routeMap).map(k => routeMap[k]);
};

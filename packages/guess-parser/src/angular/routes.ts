import * as ts from 'typescript';
import { evaluate } from '@wessberg/ts-evaluator';
import { getModuleEntryPoint, getModulePathFromRoute } from './modules';
import { resolve } from 'path';

const getObjectProp = (
  node: ts.ObjectLiteralExpression,
  prop: string
): ts.Expression | null => {
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

export const readLoadChildren = (
  node: ts.ObjectLiteralExpression,
  typeChecker: ts.TypeChecker
): string | null => {
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
      const res = evaluate({
        node: arg,
        typeChecker: typeChecker
      });
      if (res.success) {
        result = res.value as string;
      }
    }
    if (result) {
      return;
    }
    n.forEachChild(visitor);
  };
  expr.forEachChild(visitor);
  // Fallback to when loadChildren looks like:
  // loadChildren: 'foo' + '/' + 'bar'
  if (!result) {
    const res = evaluate({
      node: expr,
      typeChecker: typeChecker
    });
    if (res.success) {
      result = res.value as string;
    }
  }
  return result;
};

const readPath = (
  node: ts.ObjectLiteralExpression,
  typeChecker: ts.TypeChecker
): string | null => {
  const expr = getObjectProp(node, 'path');
  if (!expr) {
    return null;
  }
  const val = evaluate({
    node: expr,
    typeChecker
  });
  if (val.success) {
    return val.value as string;
  }
  return null;
};

const readRedirect = (
  node: ts.ObjectLiteralExpression,
  typeChecker: ts.TypeChecker
): string | null => {
  const expr = getObjectProp(node, 'redirectTo');
  if (!expr) {
    return null;
  }
  const val = evaluate({
    node: expr,
    typeChecker
  });
  if (val.success) {
    return val.value as string;
  }
  return null;
};

export const readChildren = (
  node: ts.ObjectLiteralExpression,
): ts.NodeArray<ts.Node> | null => {
  const expr = getObjectProp(node, 'children');
  if (!expr) {
    return null;
  }
  return (expr as ts.ArrayLiteralExpression).elements;
};

export interface Route {
  path: string;
  children: Route[];
  redirectTo?: string;
}

export interface LazyRoute extends Route {
  module: string;
}

export const getRoute = (
  node: ts.ObjectLiteralExpression,
  entryPoints: Set<string>,
  program: ts.Program,
  host: ts.CompilerHost
): Route | null => {
  const path = readPath(node, program.getTypeChecker());
  if (path === null) {
    return null;
  }

  const childrenArray = readChildren(node);
  let children: Route[] = [];
  if (childrenArray) {
    children = childrenArray
      .map(c => {
        if (c.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
          return null;
        }
        return getRoute(c as ts.ObjectLiteralExpression, entryPoints, program, host);
      })
      .filter(e => e !== null) as Route[];
  }

  const route: Route = { path, children };

  const redirectTo = readRedirect(node, program.getTypeChecker());
  if (redirectTo) {
    route.redirectTo = redirectTo;
  }

  const loadChildren = readLoadChildren(node, program.getTypeChecker());
  if (loadChildren) {
    const parent = getModuleEntryPoint(
      resolve(node.getSourceFile().fileName),
      entryPoints,
      program,
      host
    );
    const module = getModulePathFromRoute(parent, loadChildren, program, host);
    return {
      ...route,
      module
    } as LazyRoute;
  }

  return route;
};

export const isRoute = (n: ts.Node, typeChecker: ts.TypeChecker, redirects: boolean): boolean => {
  if (
    n.kind !== ts.SyntaxKind.ObjectLiteralExpression ||
    !n.parent ||
    n.parent.kind !== ts.SyntaxKind.ArrayLiteralExpression
  ) {
    return false;
  }

  const objLiteral = n as ts.ObjectLiteralExpression;
  const path = readPath(objLiteral, typeChecker) !== null;
  const redirectTo = redirects && readRedirect(objLiteral, typeChecker) !== null;
  const children = !!readChildren(objLiteral);
  const loadChildren = !!readLoadChildren(objLiteral, typeChecker);
  const component = !!getObjectProp(objLiteral, 'component');

  return (path && children) || (path && component) || (path && loadChildren) || (path && redirectTo);
};

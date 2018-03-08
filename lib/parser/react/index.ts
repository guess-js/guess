import { RoutingModule } from './../index';
import { readFileSync } from 'fs';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const parseConfigHost = {
  useCaseSensitiveFileNames: true,
  fileExists: fs.existsSync,
  readDirectory: ts.sys.readDirectory,
  readFile: ts.sys.readFile
};

const calcProjectFileAndBasePath = (project: string): { projectFile: string; basePath: string } => {
  const projectIsDir = fs.lstatSync(project).isDirectory();
  const projectFile = projectIsDir ? path.join(project, 'tsconfig.json') : project;
  const projectDir = projectIsDir ? project : path.dirname(project);
  const basePath = path.resolve(process.cwd(), projectDir);
  return { projectFile, basePath };
};

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
    if (c.kind === ts.SyntaxKind.JsxElement || c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
      let el: ts.JsxSelfClosingElement | ts.JsxOpeningElement = (c as ts.JsxElement).openingElement;
      if (c.kind === ts.SyntaxKind.JsxSelfClosingElement) {
        el = c as ts.JsxSelfClosingElement;
      }
      if ((el.tagName as ts.Identifier).text === 'Route') {
        const module: Partial<RoutingModule> = { lazy: true, parentModule: file.fileName };
        el.attributes.properties.forEach(p => {
          const { text } = p.name as ts.Identifier;
          if (text === 'path') {
            module.path = ((p as ts.JsxAttribute).initializer as ts.StringLiteral).text;
          }
          if (text === 'component') {
            const parts = file.fileName.split('/');
            parts.pop();
            const name = extractModule(p as ts.JsxAttribute) + '.tsx';
            module.module = path.join(...parts.concat([name]));
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

export const parseRoutes = (tsconfig: string) => {
  const { config, error } = ts.readConfigFile(tsconfig, (f: string) => readFileSync(f).toString());
  if (error) {
    throw error;
  }
  const { basePath } = calcProjectFileAndBasePath(tsconfig);
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const jsxFiles = program.getSourceFiles().filter(f => f.fileName.endsWith('.tsx') || f.fileName.endsWith('.jsx'));
  return jsxFiles.reduce((a, f) => a.concat(extractRoutes(f)), []);
};

console.log(parseRoutes('/Users/mgechev/Projects/smarty-react/tsconfig.json'));

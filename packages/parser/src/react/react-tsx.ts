import { readFileSync, lstatSync, existsSync } from 'fs';
import * as ts from 'typescript';
import { join, dirname, resolve } from 'path';
import { parseReactRoutes } from './';
import { RoutingModule } from '../../../common/interfaces';

const parseConfigHost = {
  useCaseSensitiveFileNames: true,
  fileExists: existsSync,
  readDirectory: ts.sys.readDirectory,
  readFile: ts.sys.readFile
};

const calcProjectFileAndBasePath = (project: string): { projectFile: string; basePath: string } => {
  const projectIsDir = lstatSync(project).isDirectory();
  const projectFile = projectIsDir ? join(project, 'tsconfig.json') : project;
  const projectDir = projectIsDir ? project : dirname(project);
  const basePath = resolve(process.cwd(), projectDir);
  return { projectFile, basePath };
};

export const parseRoutes = (tsconfig: string): RoutingModule[] => {
  const { config, error } = ts.readConfigFile(tsconfig, (f: string) => readFileSync(f).toString());
  if (error) {
    throw error;
  }
  const { basePath } = calcProjectFileAndBasePath(tsconfig);
  const parsed = ts.parseJsonConfigFileContent(config, parseConfigHost, basePath);
  return parseReactRoutes(parsed.fileNames, parsed.options);
};

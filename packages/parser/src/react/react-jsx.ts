import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parseReactRoutes } from '.';
import { JsxEmit } from 'typescript';
import { RoutingModule } from '../../../common/interfaces';

const readFiles = (dir: string): string[] => {
  const result = readdirSync(dir).map(node => join(dir, node));
  const files = result.filter(node => statSync(node).isFile() && node.endsWith('.jsx'));
  const dirs = result.filter(node => statSync(node).isDirectory());
  return [].concat.apply(files, dirs.map(readFiles));
};

export const parseRoutes = (base: string): RoutingModule[] => {
  return parseReactRoutes(readFiles(base), {
    jsx: JsxEmit.React,
    allowJs: true
  });
};

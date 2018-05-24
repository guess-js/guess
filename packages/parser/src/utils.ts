import { statSync, readdirSync } from 'fs';
import { join } from 'path';

export const readFiles = (dir: string): string[] => {
  if (dir === 'node_modules') {
    return [];
  }
  const result = readdirSync(dir).map(node => join(dir, node));
  const files = result.filter(node => statSync(node).isFile() && (node.endsWith('.jsx') || node.endsWith('.js')));
  const dirs = result.filter(node => statSync(node).isDirectory());
  return [].concat.apply(files, dirs.map(readFiles));
};

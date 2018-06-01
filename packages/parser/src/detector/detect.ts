import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ProjectType, ProjectMetadata } from '../../../common/interfaces';

const dep = (p: any) => (name: string) => (p.dependencies ? p.dependencies[name] : undefined);
const devDep = (p: any) => (name: string) => (p.devDependencies ? p.devDependencies[name] : undefined);

export const detect = (base: string): ProjectMetadata | undefined => {
  const path = ['package.json', '../package.json']
    .map(p => join(base, p))
    .filter(existsSync)
    .pop();

  if (!path) {
    throw new Error('Unable to discover the project type');
  }
  const content = JSON.parse(readFileSync(path).toString()) as any;
  const exists = (file: string) => existsSync(join(base, file));
  const d = dep(content);
  const dd = devDep(content);
  if (dd('@angular/cli') && exists(join('src', 'tsconfig.app.json'))) {
    return {
      type: ProjectType.AngularCLI,
      version: dd('@angular/cli'),
      details: {
        typescript: dd('typescript'),
        tsconfigPath: join(base, 'src', 'tsconfig.app.json'),
        sourceDir: 'src'
      }
    };
  }
  if (d('gatsby')) {
    return {
      type: ProjectType.Gatsby,
      version: d('gatsby')
    };
  }
  if (d('react') && d('react-scripts-ts') && exists('tsconfig.json')) {
    return {
      type: ProjectType.CreateReactAppTypeScript,
      version: d('react-scripts-ts'),
      details: {
        typescript: dd('typescript'),
        tsconfigPath: join(base, 'tsconfig.json'),
        sourceDir: 'src'
      }
    };
  }
  if (d('react') && d('react-scripts')) {
    return {
      type: ProjectType.CreateReactApp,
      version: d('react-scripts'),
      details: {
        sourceDir: 'src'
      }
    };
  }
  if (d('vue')) {
    return {
      type: ProjectType.Vue,
      version: d('vue'),
      details: {
        sourceDir: 'src'
      }
    };
  }
  return undefined;
};

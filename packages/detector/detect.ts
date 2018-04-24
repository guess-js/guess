import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ProjectType } from '../common/interfaces';

export interface AppDetails {
  typescript?: string;
}

export interface AppMetadata {
  type: ProjectType;
  version: string;
  details?: AppDetails;
}

const dep = (p: any) => (name: string) => (p.dependencies ? p.dependencies[name] : undefined);
const devDep = (p: any) => (name: string) => (p.devDependencies ? p.devDependencies[name] : undefined);

export const detect = (base: string): AppMetadata | undefined => {
  const path = ['package.json', '../package.json']
    .map(p => join(base, p))
    .filter(existsSync)
    .pop();

  if (!path) {
    throw new Error('Unable to discover the project type');
  }
  const content = JSON.parse(readFileSync(path).toString()) as any;
  const d = dep(content);
  const dd = devDep(content);
  if (dd('@angular/cli')) {
    return {
      type: ProjectType.AngularCLI,
      version: dd('@angular/cli'),
      details: {
        typescript: dd('typescript')
      }
    };
  }
  if (d('gatsby')) {
    return {
      type: ProjectType.Gatsby,
      version: d('gatsby')
    };
  }
  if (d('react') && dd('typescript')) {
    return {
      type: ProjectType.CreateReactAppTypeScript,
      version: d('react-scripts-ts'),
      details: {
        typescript: dd('typescript')
      }
    };
  }
  if (d('react')) {
    return {
      type: ProjectType.CreateReactApp,
      version: d('react-scripts')
    };
  }
  return undefined;
};

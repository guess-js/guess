export interface Neighbors {
  [key: string]: number;
}

export interface Graph {
  [key: string]: Neighbors;
}

export interface Module {
  modulePath: string;
  parentModulePath: string;
}

export interface RoutingModule {
  path: string;
  modulePath: string;
  parentModulePath: string | null;
  lazy: boolean;
  redirectTo?: string;
}

export interface Connection {
  from: string;
  weight: number;
  to: string;
}

export interface Period {
  startDate: Date;
  endDate: Date;
}

export enum ProjectType {
  AngularCLI = 'angular-cli',
  CreateReactApp = 'create-react-app',
  PreactCLI = 'preact-cli',
  Gatsby = 'gatsby',
  CreateReactAppTypeScript = 'create-react-app-typescript'
}

export interface ProjectLayout {
  typescript?: string;
  tsconfigPath?: string;
  sourceDir?: string;
}

export interface ProjectMetadata {
  type: ProjectType;
  version: string;
  details?: ProjectLayout;
}

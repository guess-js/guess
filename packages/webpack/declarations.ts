import { Graph, RoutingModule } from '../common/interfaces';

export enum Mode {
  Angular = 'angular',
  ReactTypescript = 'react-typescript',
  Gatsby = 'gatsby',
  Auto = 'auto'
}

export interface RouteProvider {
  (): RoutingModule[];
}

export type Cluster = string[];
export type Clusters = Cluster[];

export interface ClusteringAlgorithm {
  (graph: Graph, modules: Module[], totalClusters: number): Clusters;
}

export interface Module {
  modulePath: string;
  parentModulePath: string;
}

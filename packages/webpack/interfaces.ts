import { Graph, RoutingModule } from '../common/interfaces';

export interface RouteProvider {
  (): RoutingModule[];
}

export interface Neighbor {
  route: string;
  file?: string;
  chunk?: string;
  probability: number;
}

export interface RuntimeMap {
  [route: string]: Neighbor[];
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

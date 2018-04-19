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

export type CompressedPrefetchGraph = number[][][];

export interface CompressedGraphMap {
  chunks: string[];
  routes: string[];
}

export interface PrefetchConfig {
  '4g': number;
  '3g': number;
  '2g': number;
  'slow-2g': number;
}

export interface PrefetchPluginConfig {
  debug?: boolean;
  data: Graph;
  basePath?: string;
  prefetchConfig?: PrefetchConfig;
  routes: RoutingModule[];
}

export interface BundleEntryNeighbor {
  route: string;
  probability: number;
  file: string;
}

export interface BundleEntryGraph {
  [node: string]: BundleEntryNeighbor[];
}

export interface PrefetchNeighbor {
  route: string;
  probability: number;
  chunk: string;
}

export interface PrefetchGraph {
  [node: string]: PrefetchNeighbor[];
}

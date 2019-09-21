import { Graph, RoutingModule } from '../../common/interfaces';

export enum Mode {
  Angular = 'angular',
  ReactTSX = 'react-tsx',
  ReactJSX = 'react-jsx',
  PreactJSX = 'preact-jsx',
  Gatsby = 'gatsby',
  Auto = 'auto'
}

export type RouteProvider = () => Promise<RoutingModule[]>;

export type Cluster = string[];
export type Clusters = Cluster[];

export type ClusteringAlgorithm = (graph: Graph, modules: Module[], totalClusters: number) => Clusters;

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
  basePath: string;
  prefetchConfig?: PrefetchConfig;
  routes: RoutingModule[];
  delegate: boolean;
}

export interface BundleEntryNeighbor {
  route: string;
  probability: number;
  file: string;
}

export interface BundleEntryGraph {
  [route: string]: BundleEntryNeighbor[];
}

export interface PrefetchNeighbor {
  route: string;
  probability: number;
  chunk: string;
}

export interface PrefetchGraph {
  [route: string]: PrefetchNeighbor[];
}

export interface PrefetchAotNeighbor {
  probability: number;
  chunks: string[];
}

export interface FileChunkMap {
  [path: string]: { file: string, deps: Set<string> } | null
}

export interface PrefetchAotGraph {
  [route: string]: PrefetchAotNeighbor[];
}

export interface PrefetchAotPluginConfig {
  debug?: boolean;
  data: Graph;
  base: string;
  prefetchConfig?: PrefetchConfig;
  routes: RoutingModule[];
}

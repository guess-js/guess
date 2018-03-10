import { RoutingModule } from '../parser';
import { Graph } from '../store/store';
import { Module } from '../ml/clusterize';

export interface RouteProvider {
  (...params: any[]): RoutingModule;
}

export type Cluster = string[];
export type Clusters = Cluster[];

export interface ClusterizationAlgorithm {
  (graph: Graph, modules: Module[], totalClusters: number): Clusters;
}

export interface BuildConfig {
  totalClusters: number;
  algorithm?: ClusterizationAlgorithm;
}

export interface MLPluginConfig {
  runtime?: boolean;
  build?: BuildConfig | false;
  routeProvider?: RouteProvider;
}

class MLPlugin {}

import { Graph, Module } from '../common/interfaces';
import { clusterize } from 'bundle-clusterizer';

export type Cluster = string[];
export type Clusters = Cluster[];

export interface ClusterizationAlgorithm {
  (graph: Graph, modules: Module[], totalClusters: number): Clusters;
}

export interface Module {
  path: string;
  parentModule: string;
}

export interface ClusterizeChunksConfig {
  moduleGraph: Graph;
  modules: Module[];
  algorithm: ClusterizationAlgorithm;
  totalChunks: number;
}

export class ClusterizeChunksPlugin {
  private _clusters: Clusters | Cluster;

  constructor(config: ClusterizeChunksConfig) {
    if (config.algorithm) {
      this._clusters = config.algorithm(config.moduleGraph, config.modules, config.totalChunks);
    } else {
      this._clusters = clusterize(config.moduleGraph, config.modules, config.totalChunks);
    }
  }

  apply(compiler: any) {
    const valid = (a: any) => a.blocks && a.blocks[0] && a.blocks[0].dependencies && a.blocks[0].dependencies[0];

    const inSameCluster = (a: any, b: any) => {
      if (!valid(a) || !valid(b)) {
        return false;
      }
      const fileA = a.blocks[0].dependencies[0].request;
      const fileB = b.blocks[0].dependencies[0].request;
      const values = Object.keys(this._clusters).map((k: any) => this._clusters[k]);
      for (const c of values) {
        if (c.indexOf(fileA) >= 0 && c.indexOf(fileB) >= 0) {
          return true;
        }
      }
      return false;
    };

    compiler.plugin('compilation', (compilation: any) => {
      compilation.plugin('optimize-chunks', (chunks: any) => {
        for (const a of chunks) {
          for (const b of chunks) {
            if (a === b) {
              continue;
            }
            if (inSameCluster(a, b)) {
              if (b.integrate(a, 'clusterize-chunks')) {
                chunks.splice(chunks.indexOf(a), 1);
                return true;
              }
            }
          }
        }
      });
    });
  }
}

import { Graph } from '../common/interfaces';
import { clusterize } from 'bundle-clusterizer';
import { ClusterizationAlgorithm, Cluster, Clusters, Module } from './interfaces';

export interface ClusterizeChunksConfig {
  debug?: boolean;
  moduleGraph: Graph;
  modules: Module[];
  algorithm: ClusterizationAlgorithm;
  minChunks: number;
}

export class ClusterizeChunksPlugin {
  private _clusters: Clusters;
  private _debug: boolean;

  constructor(config: ClusterizeChunksConfig) {
    this._debug = !!config.debug;
    if (config.algorithm) {
      this._clusters = config.algorithm(config.moduleGraph, config.modules, config.minChunks);
    } else {
      this._clusters = clusterize(config.moduleGraph, config.modules, config.minChunks);
    }
    this._debug && console.debug('Clusters', this._clusters);
  }

  apply(compiler: any) {
    const valid = (a: any) => a.blocks && a.blocks[0] && a.blocks[0].dependencies && a.blocks[0].dependencies[0];

    const inSameCluster = (a: any, b: any) => {
      if (!valid(a) || !valid(b)) {
        return false;
      }
      const fileA = a.blocks[0].dependencies[0].request;
      const fileB = b.blocks[0].dependencies[0].request;
      for (const c of this._clusters) {
        if (c.indexOf(fileA) >= 0 && c.indexOf(fileB) >= 0) {
          this._debug && console.debug('Merging', fileA, fileB);
          return true;
        }
      }
      return false;
    };

    compiler.plugin('compilation', (compilation: any) => {
      compilation.plugin('optimize-chunks', (chunks: any) => {
        const allFilesFromChunks = [].concat.apply([], this._clusters);
        for (const a of chunks) {
          if (valid(a)) {
            let found = false;
            allFilesFromChunks.forEach((f: string) => {
              if (f === a.blocks[0].dependencies[0].request) {
                found = true;
              }
            });
            if (!found) {
              this._debug && console.debug('Not found in clusters', a.blocks[0].dependencies[0].request);
            }
          }
        }
        for (let i = 0; i < chunks.length - 1; i += 1) {
          const a = chunks[i];
          for (let j = i + 1; j < chunks.length; j += 1) {
            const b = chunks[j];
            if (inSameCluster(a, b)) {
              if (a.integrate(b, 'clusterize-chunks')) {
                chunks.splice(j--, 1);
                this._debug && console.debug('Merged chunks. Total: ', chunks.length);
              } else {
                this._debug && console.debug('Unable to integrate chunks');
              }
            }
          }
        }
      });
    });
  }
}

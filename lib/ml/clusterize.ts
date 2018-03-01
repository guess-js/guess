import { RouteDefinition } from './../ng/index';
import { tarjan, NeighborListGraph } from './graph/tarjan';
import { Graph } from './../store/store';

const connected = (a: string, b: string, graph: Graph) => {
  return (graph[a] && graph[a][b] && graph[a][b] > 0) || (graph[b] && graph[b][a] && graph[b][a] > 0);
};

const neighborsList = (graph: Graph, nodes: Set<string>) => {
  const nl: NeighborListGraph = {};
  for (const a of nodes.values()) {
    nl[a] = [];
    for (const b of nodes.values()) {
      if (a === b) {
        continue;
      }
      if (connected(a, b, graph)) {
        nl[a].push(b);
      }
    }
  }
  return nl;
};

const trimGraph = (graph: Graph) => {
  let minEdge = Infinity;
  Object.keys(graph).forEach(k => {
    Object.keys(graph[k]).forEach(n => {
      if (graph[k][n] < minEdge && graph[k][n] > 0) {
        minEdge = graph[k][n];
      }
    });
  });

  Object.keys(graph).forEach(k => {
    Object.keys(graph[k]).forEach(n => {
      graph[k][n] = Math.max(graph[k][n] - minEdge, 0);
    });
  });
};

// Turn into a Markov chain
const normalize = (graph: Graph) => {
  Object.keys(graph).forEach(k => {
    const ns = Object.keys(graph[k]);
    const total = ns.reduce((a, c) => a + graph[k][c], 0);
    ns.forEach(n => (graph[k][n] = graph[k][n] / total));
  });
};

type Cluster = string[];
type Clusters = Cluster[];

class BundleNode {
  routes: RouteDefinition[] = [];
  children: { [key: string]: BundleNode } = {};
  constructor(public module: RouteDefinition, public parent: BundleNode) {}
}

class BundleTree {
  root: BundleNode = null;

  build(m: RouteDefinition[]) {
    const modules = m.slice();
    const r = (m: RouteDefinition) => {
      if (!m.parentModule) {
        this.root = new BundleNode(m, null);
        return true;
      }
      return false;
    };
    const c = (m: RouteDefinition) => {
      if (!m.parentModule) {
        this.root.routes.push(m);
        return true;
      }
      if (this.find(m.parentModule)) {
        this.insert(m);
        return true;
      }
      return false;
    };
    while (modules.length) {
      for (const m of modules) {
        let processed = false;
        if (this.root) {
          processed = c(m);
        } else {
          processed = r(m);
        }
        if (processed) {
          modules.splice(modules.indexOf(m), 1);
        }
      }
    }
  }

  insert(m: RouteDefinition) {
    const parent = this.find(m.parentModule);
    parent.children[m.module] = parent.children[m.module] || new BundleNode(m, null);
    parent.children[m.module].routes.push(m);
  }

  lca(a: RouteDefinition, b: RouteDefinition): RouteDefinition | null {
    let na = this.find(a.module);
    let nb = this.find(b.module);
    if (!na || !nb) {
      return null;
    }

    const visited: { [key: string]: boolean } = {};

    let nodeA = na;
    while (nodeA) {
      visited[nodeA.module.module] = true;
      nodeA = nodeA.parent;
    }

    let nodeB = nb;
    while (nodeB) {
      if (visited[nodeB.module.module]) {
        return nodeB.module;
      }
      visited[nodeB.module.module] = true;
      nodeB = nodeB.parent;
    }

    nodeA = na;
    while (nodeA) {
      if (visited[nodeA.module.module]) {
        return nodeA.module;
      }
      nodeA = nodeA.parent;
    }

    return null;
  }

  find(node: string) {
    if (!this.root) {
      return null;
    }
    const stack = [this.root];
    while (stack.length) {
      const c = stack.pop();
      if (c.module.module === node) {
        return c;
      }
      Object.keys(c.children).forEach(k => {
        stack.push(c.children[k]);
      });
    }
    return null;
  }
}

const whatever = (
  cluster: Cluster,
  tree: BundleTree,
  pathCluster: { [key: string]: Cluster },
  pathModule: { [key: string]: RouteDefinition }
) => {
  let changed = false;
  for (const a of cluster) {
    for (const b of cluster) {
      if (a === b) {
        continue;
      }
      const ancestor = tree.lca(pathModule[a || '/.'], pathModule[b || '/.']);
      if (!ancestor) {
        throw new Error('Cannot find LCA');
      }
      if (cluster.indexOf(ancestor.path) < 0) {
        while ((pathCluster[ancestor.path] || []).length) {
          cluster.push(pathCluster[ancestor.path].pop());
          changed = true;
        }
      }
    }
  }
  if (changed) {
    whatever(cluster, tree, pathCluster, pathModule);
  }
};

export const clusterize = (graph: Graph, n: number, modules: RouteDefinition[]) => {
  if (n <= 0) {
    throw new Error('The number of bundles should be a positive number');
  }

  const nodes = new Set<string>();
  Object.keys(graph).forEach(k => {
    nodes.add(k);
    Object.keys(graph[k]).forEach(n => {
      nodes.add(n);
    });
  });

  if (n > nodes.size) {
    throw new Error('The number of bundles should be less than the number of routes');
  }

  const result: string[] = [];
  if (n === nodes.size) {
    for (const r of nodes.values()) {
      result.push(r);
    }
    return result;
  }

  normalize(graph);

  const bundleTree = new BundleTree();
  bundleTree.build(modules);

  const pathModule: { [key: string]: RouteDefinition } = {};
  modules.forEach(m => {
    pathModule[m.path] = m;
  });

  while (true) {
    const nl = neighborsList(graph, nodes);
    const cc = tarjan(nl);

    const bundleClusterMap: { [key: string]: Cluster } = {};

    cc.forEach(c => {
      for (const n of c) {
        bundleClusterMap[n] = c;
      }
    });

    cc.forEach(c => {
      whatever(c, bundleTree, bundleClusterMap, pathModule);
    });

    const res = cc.filter(c => c.length);
    if (res.length >= n) {
      return res;
    }
    trimGraph(graph);
  }
};

import { Module } from './clusterize';
import { NeighborListGraph } from './graph/tarjan';
import { topologicalSort } from './graph/topological-sort';

export class BundleNode {
  defs: Module[] = [];
  children: { [key: string]: BundleNode } = {};
  constructor(public key: string, public parent: BundleNode) {}
}

export class BundleTree {
  root: BundleNode = null;

  build(m: Module[]) {
    const roots = m.filter(c => !c.parentModule);
    if (roots.length !== 1) {
      throw new Error('Only one root entry point required');
    }

    const root = roots[0];

    m = m.filter(c => c.parentModule);

    // Build neighbors list
    const graph: NeighborListGraph = {};
    for (const c of m) {
      graph[c.module] = [];
    }
    const moduleMap: { [module: string]: Module[] } = {};
    for (const c of m) {
      if (c.parentModule !== root.module) {
        graph[c.parentModule].push(c.module);
      }
      moduleMap[c.module] = moduleMap[c.module] || [];
      moduleMap[c.module].push(c);
    }
    // Remove duplicates
    Object.keys(graph).forEach(n => {
      graph[n] = graph[n].filter((e, i) => graph[n].indexOf(n) === i);
    });
    const insertionOrder = topologicalSort(graph).reverse();
    this.root = new BundleNode(root.module, null);
    this.root.defs.push(root);

    for (const c of insertionOrder) {
      const parentEntry = moduleMap[c][0].parentModule;
      const parent = this.find(parentEntry);
      if (!parent) {
        throw new Error(`Cannot find parent bundle for ${c}`);
      }
      const node = parent.children[c] || new BundleNode(c, parent);
      moduleMap[c].forEach(m => node.defs.push(m));
      parent.children[c] = node;
    }
  }

  lca(a: Module, b: Module): Module[] | null {
    let na = this.find(a.module);
    let nb = this.find(b.module);
    if (!na || !nb) {
      return null;
    }

    const visited: { [key: string]: boolean } = {};

    let nodeA = na;
    while (nodeA) {
      visited[nodeA.key] = true;
      nodeA = nodeA.parent;
    }

    let nodeB = nb;
    while (nodeB) {
      if (visited[nodeB.key]) {
        return nodeB.defs;
      }
      visited[nodeB.key] = true;
      nodeB = nodeB.parent;
    }

    nodeA = na;
    while (nodeA) {
      if (visited[nodeA.key]) {
        return nodeA.defs;
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
      if (c.key === node) {
        return c;
      }
      Object.keys(c.children).forEach(k => {
        stack.push(c.children[k]);
      });
    }
    return null;
  }
}

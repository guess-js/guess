import { Module } from './clusterize';

export class BundleNode {
  defs: Module[] = [];
  children: { [key: string]: BundleNode } = {};
  constructor(public key: string, public parent: BundleNode) {}
}

export class BundleTree {
  root: BundleNode = null;

  // TODO: use topological sort in order to insert the elements
  // with linear complexity.
  build(m: Module[]) {
    const modules = m.slice();
    const r = (c: Module) => {
      for (const p of m) {
        if (c === p) {
          continue;
        }
        if (p.module === c.parentModule) {
          return false;
        }
      }
      if (!this.root) {
        this.root = new BundleNode(c.parentModule, null);
      }
      const node = new BundleNode(c.module, null);
      this.root.children[c.module] = node;
      node.defs.push(c);
      return true;
    };
    const c = (m: Module) => {
      const current = this.find(m.module);
      if (current) {
        current.defs.push(m);
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

  insert(m: Module) {
    const parent = this.find(m.parentModule);
    const node = new BundleNode(m.module, null);
    parent.children[m.module] = parent.children[m.module] || node;
    node.defs.push(m);
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

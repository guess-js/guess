import { RouteDefinition } from './../ng/index';

export class BundleNode {
  defs: RouteDefinition[] = [];
  children: { [key: string]: BundleNode } = {};
  constructor(public key: string, public parent: BundleNode) {}
}

export class BundleTree {
  root: BundleNode = null;

  build(m: RouteDefinition[]) {
    const modules = m.slice();
    const r = (m: RouteDefinition) => {
      if (!m.parentModule) {
        this.root = new BundleNode(m.module, null);
        this.root.defs.push(m);
        return true;
      }
      return false;
    };
    const c = (m: RouteDefinition) => {
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

  insert(m: RouteDefinition) {
    const parent = this.find(m.parentModule);
    const node = new BundleNode(m.module, null);
    parent.children[m.module] = parent.children[m.module] || node;
    node.defs.push(m);
  }

  lca(a: RouteDefinition, b: RouteDefinition): RouteDefinition[] | null {
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

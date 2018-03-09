import { BundleTree } from '../bundle-tree';
import { Module } from '../clusterize';

describe(BundleTree.name, () => {
  it('should index modules', () => {
    const modules: Module[] = [
      {
        module: '/root',
        parentModule: null
      },
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child2',
        parentModule: '/root'
      },
      {
        module: '/child3',
        parentModule: '/child1'
      }
    ];

    const tree = new BundleTree();
    expect(() => tree.build(modules)).not.toThrow();
  });

  it('should throw without a root module', () => {
    const modules: Module[] = [
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child2',
        parentModule: '/root'
      },
      {
        module: '/child3',
        parentModule: '/child1'
      }
    ];

    const tree = new BundleTree();
    expect(() => tree.build(modules)).toThrow();
  });

  it('should throw without a parent module', () => {
    const modules: Module[] = [
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child4',
        parentModule: '/root'
      },
      {
        module: '/child4',
        parentModule: '/root'
      },
      {
        module: '/child2',
        parentModule: '/root'
      },
      {
        module: '/child3',
        parentModule: '/child1'
      }
    ];

    const tree = new BundleTree();
    expect(() => tree.build(modules)).toThrow();
  });

  it('should find the LCA', () => {
    const modules: Module[] = [
      {
        module: '/root',
        parentModule: null
      },
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child1',
        parentModule: '/root'
      },
      {
        module: '/child2',
        parentModule: '/root'
      },
      {
        module: '/child3',
        parentModule: '/child1'
      }
    ];

    const tree = new BundleTree();
    tree.build(modules);
    const lca = tree.lca(
      {
        module: '/child3',
        parentModule: '/child1'
      },
      {
        module: '/child1',
        parentModule: '/root'
      }
    );

    expect(lca.length).toBe(2);
    expect(lca[0].module).toBe('/child1');
  });
});

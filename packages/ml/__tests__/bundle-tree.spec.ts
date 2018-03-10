import { BundleTree } from '../bundle-tree';
import { Module } from '../clusterize';

describe(BundleTree.name, () => {
  it('should index modules', () => {
    const modules: Module[] = [
      {
        modulePath: '/qux',
        parentModulePath: null
      },
      {
        modulePath: '/root',
        parentModulePath: '/qux'
      },
      {
        modulePath: '/child1',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child1',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child2',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child3',
        parentModulePath: '/child1'
      }
    ];

    const tree = new BundleTree();
    expect(() => tree.build(modules)).not.toThrow();
  });

  it('should find the LCA', () => {
    const modules: Module[] = [
      {
        modulePath: '/qux',
        parentModulePath: null
      },
      {
        modulePath: '/root',
        parentModulePath: '/qux'
      },
      {
        modulePath: '/child1',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child1',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child2',
        parentModulePath: '/root'
      },
      {
        modulePath: '/child3',
        parentModulePath: '/child1'
      }
    ];

    const tree = new BundleTree();
    tree.build(modules);
    const lca = tree.lca(
      {
        modulePath: '/child3',
        parentModulePath: '/child1'
      },
      {
        modulePath: '/child1',
        parentModulePath: '/root'
      }
    );

    expect(lca.length).toBe(2);
    expect(lca[0].modulePath).toBe('/child1');
  });
});

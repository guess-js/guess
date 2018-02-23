import { Connection } from './network';
const level = require('level');
const levelgraph = require('levelgraph');

export const dbStorage = (name: string) => {
  const db = levelgraph(level(name));
  return {
    save(nodes: Connection[]) {
      return new Promise((resolve, reject) => {
        db.put(
          nodes.map(n => ({ object: n.first, predicate: n.weight, subject: n.second })),
          (e: Error) => (e ? reject(e) : resolve())
        );
      });
    },
    query(node: string) {
      return new Promise((resolve, reject) => {
        console.log(node);
        return db.search(
          { object: node, subject: db.v('to'), predicate: db.v('weight') },
          (err: any, val: any) => (err ? reject(err) : resolve(val))
        );
      });
    }
  };
};

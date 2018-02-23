import { Connection } from './network';
const level = require('level');
const levelgraph = require('levelgraph');

export const dbStorage = (name: string) => {
  const db = levelgraph(level(name));
  return {
    save(node: Connection[]) {
      return new Promise((resolve, reject) => {
        db.put(node, (e: Error) => (e ? reject(e) : reject()));
      });
    }
  };
};

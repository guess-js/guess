import { join } from 'path';
import { exists as nodeExists, readFile as nodeReadFile, writeFile as nodeWriteFile } from 'fs';
import { Graph, Connection } from '../common/interfaces';

const Root = join('db');

async function exists(file: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    nodeExists(file, e => {
      resolve(e);
    });
  });
}

async function readFile(file: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    nodeReadFile(file, (e, f) => {
      if (e) {
        reject(e);
      } else {
        resolve(f.toString());
      }
    });
  });
}

async function writeFile(file: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    nodeWriteFile(file, content, e => {
      if (e) {
        reject(e);
      } else {
        resolve();
      }
    });
  });
}

async function readGraph(file: string) {
  return JSON.parse(await readFile(file)) as Graph;
}

export const dbStorage = (name: string) => {
  const dbFile = join(Root, name + '.json');
  return {
    async addNodes(nodes: Connection[]) {
      let graph: Graph = {};
      if (await exists(dbFile)) {
        graph = await readGraph(dbFile);
      }
      nodes.forEach(n => {
        const r = graph[n.from] || {};
        r[n.to] = n.weight + (r[n.to] || 0);
        graph[n.from] = r;
      });
      return writeFile(dbFile, JSON.stringify(graph, null, 2));
    },
    all() {
      return readGraph(dbFile);
    }
  };
};

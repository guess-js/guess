import { Connection } from './network';

export const normalize = (data: any) => {
  return data.rows
    .map((r: any) => {
      return {
        first: r.dimensions[0],
        second: r.dimensions[1],
        weight: r.metrics[0].value
      };
    })
    .filter((node: Connection) => node.first !== '(entrance)' && node.first !== node.second);
};

import { Connection } from '../store';

export const normalize = (data: any) => {
  return data.rows
    .map((r: any) => {
      return {
        from: r.dimensions[0].split('?')[0],
        to: r.dimensions[1].split('?')[0],
        weight: parseInt(r.metrics[0].values[0])
      };
    })
    .filter((node: Connection) => node.from !== '(entrance)' && node.from !== node.to);
};

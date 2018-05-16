import { Connection } from '../../common/interfaces';

export const matchRoute = (route: string, declaration: string): boolean => {
  const routeParts: string[] = route.split('/');
  const declarationParts: string[] = declaration.split('/');

  if (routeParts.length !== declarationParts.length) {
    return false;
  } else {
    return declarationParts.reduce((a: boolean, p: string, i: number) => {
      if (p.startsWith(':')) {
        return a;
      }
      return a && p === routeParts[i];
    }, true);
  }
};

const findRoute = (d: string[], r: string) =>
  d.filter(def => def.indexOf(':') < 0).find(c => matchRoute(r, c)) || d.find(c => matchRoute(r, c)) || r;

const processRoute = (declarations: string[], route: string) => findRoute(declarations, route.split('?')[0]);

export const normalize = (data: any, formatter: (s: string) => string, declarations: string[]) => {
  return (data.rows || [])
    .map((r: any) => {
      return {
        from: processRoute(declarations, formatter(r.dimensions[0])),
        to: processRoute(declarations, formatter(r.dimensions[1])),
        weight: parseInt(r.metrics[0].values[0], 10)
      };
    })
    .filter((node: Connection) => node.from !== '(entrance)' && node.from !== node.to);
};

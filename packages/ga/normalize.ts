import { Connection } from '../common/interfaces';

export const matchRoute = (route: string, declaration: string): boolean => {
  const routeParts: string[] = route.split('/');
  const declarationParts: string[] = declaration.split('/');
  if (routeParts.length > 0 && routeParts[routeParts.length - 1] === '') {
    routeParts.pop();
  }

  if (declarationParts.length > 0 && declarationParts[declarationParts.length - 1] === '') {
    declarationParts.pop();
  }

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

// TODO optimize
const findRoute = (d: string[], r: string) => {
  const res = d.filter(d => d.indexOf(':') < 0).find(c => matchRoute(r, c)) || d.find(c => matchRoute(r, c));
  if (!res && r && r !== '(entrance)' && d.length) {
    console.warn(`No declaration for ${r}`);
  }
  return res || r;
};

const processRoute = (declarations: string[], route: string) => {
  return findRoute(declarations, route.split('?')[0].replace(/\/$/, ''));
};

export const normalize = (data: any, formatter: (s: string) => string, declarations: string[]) => {
  return data.rows
    .map((r: any) => {
      return {
        from: processRoute(declarations, formatter(r.dimensions[0])),
        to: processRoute(declarations, formatter(r.dimensions[1])),
        weight: parseInt(r.metrics[0].values[0])
      };
    })
    .filter((node: Connection) => node.from !== '(entrance)' && node.from !== node.to);
};

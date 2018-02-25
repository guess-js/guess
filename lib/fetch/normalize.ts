import { Connection } from '../store';

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
  const res = d.filter(d => d.indexOf(':') < 0).find(c => matchRoute(c, r)) || d.find(c => matchRoute(c, r));
  if (!res) {
    console.warn(`Cannot find declaration for ${r}`);
  }
  return res || r;
};

export const normalize = (data: any, declarations: string[]) => {
  return data.rows
    .map((r: any) => {
      return {
        from: findRoute(declarations, r.dimensions[0].split('?')[0]),
        to: findRoute(declarations, r.dimensions[1].split('?')[0]),
        weight: parseInt(r.metrics[0].values[0])
      };
    })
    .filter((node: Connection) => node.from !== '(entrance)' && node.from !== node.to);
};

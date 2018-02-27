import { ProjectSymbols } from 'ngast';
import { readFileSync, readFile, writeFileSync } from 'fs';
import { CompileIdentifierMetadata, CompileProviderMetadata } from '@angular/compiler';
import { Route } from '@angular/compiler/src/core';
import { join } from 'path';

interface Module {
  parents: Module[];
  name: string;
  paths: string[];
}

interface ModuleTree {
  [key: string]: Module;
}

interface RawModuleData {
  provider: CompileProviderMetadata;
  module: CompileIdentifierMetadata;
}

const processRoutes = (name: string, routes: Route[]) => {};

const key = (ref: any) => ref.filePath + '#' + ref.name;

const processModule = (m: RawModuleData, result: ModuleTree) => {
  const ref = m.module.reference;
  const name = key(ref);
  const routes = m.provider.useValue;
  processRoutes(name, routes);
};

const collectRoutes = (modules: RawModuleData[], result: ModuleTree) => {
  modules.forEach(m => processModule(m, result));
};

export interface RouteDefinition {
  path: string;
  module: string;
  parentModule: string;
  lazy: boolean;
}

export const parseRoutes = (tsconfig: string): RouteDefinition[] => {
  const s = new ProjectSymbols(
    tsconfig,
    {
      get(name: string) {
        return new Promise((resolve: any, reject: any) => {
          readFile(name, (e, data) => {
            if (e) reject(e);
            else resolve(data.toString());
          });
        });
      },
      getSync(name: string) {
        return readFileSync(name, { encoding: 'utf-8' });
      }
    },
    e => console.error(e)
  );

  const m = s.getModules().map(m => {
    return m.getModuleSummary().providers.filter(p => {
      return p.provider.token.identifier.reference.name === 'ROUTES';
    });
  });

  const flattened = m.concat.apply([], m) as RawModuleData[];

  const rawMap: { [key: string]: RawModuleData } = {};
  flattened.forEach(m => {
    rawMap[key(m.module.reference)] = m;
  });

  const root = flattened.find(m => m.module.reference.name === 'AppModule');

  const result: RouteDefinition[] = [];

  const findRoutes = (
    modulePath: string,
    routes: Route[],
    parentRoute: string,
    rawMap: { [key: string]: RawModuleData },
    result: RouteDefinition[],
    parentModule: string | null
  ) => {
    const parts = modulePath.split('/');
    parts.pop();
    const filePath = parts.join('/');

    interface RouteWithParent {
      route: Route;
      parent: string;
    }

    const r: RouteWithParent[] = routes.map(r => ({
      route: r,
      parent: parentRoute
    }));

    while (r.length) {
      const c = r.pop();
      const path = (c.route as any).path;

      result.push({
        path: join(c.parent, path),
        module: modulePath,
        lazy: !!c.route.loadChildren,
        parentModule: parentModule
      });

      if (c.route.loadChildren) {
        const parts = c.route.loadChildren.split('#');
        const childModule = join(filePath, parts[0]) + '.ts';
        const key = childModule + '#' + parts[1];
        findRoutes(
          childModule,
          rawMap[key].provider.useValue as Route[],
          join(c.parent, (c.route as any).path),
          rawMap,
          result,
          modulePath
        );
      }
      (c.route.children || []).forEach(x => {
        r.push({
          route: x,
          parent: join(c.parent, path)
        });
      });
    }
  };

  findRoutes(root.module.reference.filePath, root.provider.useValue as Route[], '', rawMap, result, null);

  return result.map(r => ({
    path: `/${r.path}`,
    module: r.module,
    lazy: r.lazy,
    parentModule: r.parentModule
  }));
};

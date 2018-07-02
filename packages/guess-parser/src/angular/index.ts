import { ProjectSymbols, ModuleSymbol } from 'ngast';
import { readFileSync, readFile, writeFileSync } from 'fs';
import { CompileIdentifierMetadata, CompileProviderMetadata } from '@angular/compiler';
import { Route } from '@angular/compiler/src/core';
import { join, normalize } from 'path';
import { constructDependencies } from '@angular/core/src/di/reflective_provider';
import { RoutingModule } from '../../../common/interfaces';

export interface RawModuleData {
  provider: CompileProviderMetadata;
  module: CompileIdentifierMetadata;
}

interface Module {
  parents: Module[];
  name: string;
  paths: string[];
}

interface ModuleTree {
  [key: string]: Module;
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

const getRootModule = (projectSymbols: ProjectSymbols) => {
  return projectSymbols.getModules().reduce((res: RawModuleData | null, module: ModuleSymbol) => {
    const summary = module.getModuleSummary();
    if (!summary || res) {
      return res;
    }
    const initializerModules = new Set(
      summary.providers
        .filter(
          p => !!p.provider.token.identifier && p.provider.token.identifier.reference.name === 'ROUTER_INITIALIZER'
        )
        .map(moduleWithProvider => moduleWithProvider.module)
    );
    return (
      summary.providers
        .filter(
          p =>
            !!p.provider.token.identifier &&
            p.provider.token.identifier.reference.name === 'ROUTES' &&
            initializerModules.has(p.module)
        )
        .pop() || null
    );
  }, null);
};

const getProjectSymbols = (tsconfig: string) => {
  return new ProjectSymbols(
    tsconfig,
    {
      get(name: string) {
        return new Promise((resolve: any, reject: any) => {
          readFile(name, (e, data) => {
            if (e) {
              reject(e);
            } else {
              resolve(data.toString());
            }
          });
        });
      },
      getSync(name: string) {
        return readFileSync(name, { encoding: 'utf-8' });
      }
    },
    e => console.error(e)
  );
};

const getRoutingModules = (projectSymbols: ProjectSymbols) => {
  return projectSymbols.getModules().map((module: ModuleSymbol) => {
    const summary = module.getModuleSummary();
    if (!summary) {
      return [];
    }
    return summary.providers.filter(
      p => p.provider.token.identifier && p.provider.token.identifier.reference.name === 'ROUTES'
    );
  });
};

const addParentModuleAliases = (modules: ModuleSymbol[], moduleMap: { [key: string]: RawModuleData }) => {
  modules.forEach(m => {
    const summary = m.getModuleSummary();
    if (!summary) {
      return;
    }
    summary.modules.forEach(child => {
      const symbol = child.reference;
      const id = `${symbol.filePath}#${symbol.name}`;
      if (moduleMap[id]) {
        moduleMap[`${m.symbol.filePath}#${m.symbol.name}`] = moduleMap[id];
      }
    });
  });
};

const removeDuplicates = (input: RoutingModule[]): RoutingModule[] => {
  const existing = new Set<string>();
  const result: RoutingModule[] = [];
  input.forEach(current => {
    if (existing.has(current.path)) {
      return;
    }
    existing.add(current.path);
    result.push(current);
  });
  return result;
};

export const parseRoutes = (tsconfig: string): RoutingModule[] => {
  const projectSymbols = getProjectSymbols(tsconfig);
  const allRoutingModules = getRoutingModules(projectSymbols);
  const flattened = allRoutingModules.concat.apply([], allRoutingModules) as RawModuleData[];
  const root = getRootModule(projectSymbols);
  if (!root) {
    throw new Error('Cannot find the root module');
  }

  const rawMap: { [key: string]: RawModuleData } = {};
  flattened.forEach(module => {
    rawMap[key(module.module.reference)] = module;
  });

  addParentModuleAliases(projectSymbols.getModules(), rawMap);

  const result: RoutingModule[] = [];

  const findRoutes = (
    modulePath: string,
    routes: Route[],
    parentRoute: string,
    rawModuleMap: { [key: string]: RawModuleData },
    routingModules: RoutingModule[],
    parentModule: string | null
  ) => {
    const parts = modulePath.split('/');
    parts.pop();
    const filePath = parts.join('/');

    interface RouteWithParent {
      route: Route;
      parent: string;
    }

    const r: RouteWithParent[] = routes.map(currentRoute => ({
      route: currentRoute,
      parent: parentRoute
    }));

    while (r.length) {
      const c = r.pop() as RouteWithParent;
      const path = (c.route as any).path;

      let module = modulePath;
      if (c.route.loadChildren) {
        const routePath = c.route.loadChildren.split('#')[0] + '.ts';
        const parentParts = modulePath.split('/');
        parentParts.pop();
        const parentPath = parentParts.join('/');
        module = join(parentPath, routePath);
      }

      const currentPath = normalize('/' + join(c.parent, path));
      routingModules.push({
        path: currentPath,
        modulePath: module,
        lazy: !!c.route.loadChildren,
        parentModulePath: currentPath === '/' ? null : modulePath
      });

      if (c.route.loadChildren) {
        const routeParts = c.route.loadChildren.split('#');
        const childModule = join(filePath, routeParts[0]) + '.ts';
        const moduleKey = childModule + '#' + routeParts[1];

        // We want to invoke the function recursively only
        // with routing modules.
        if (rawModuleMap[moduleKey]) {
          findRoutes(
            childModule,
            rawModuleMap[moduleKey].provider.useValue as Route[],
            join(c.parent, (c.route as any).path),
            rawModuleMap,
            routingModules,
            modulePath
          );
        }
      }
      (c.route.children || []).forEach(x => {
        r.push({
          route: x,
          parent: join(c.parent, path)
        });
      });
    }
  };

  if (root) {
    findRoutes(root.module.reference.filePath, root.provider.useValue as Route[], '', rawMap, result, null);
  }

  return removeDuplicates(result);
};

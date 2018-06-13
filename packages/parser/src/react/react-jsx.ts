import { parseReactRoutes } from '.';
import { JsxEmit } from 'typescript';
import { RoutingModule } from '../../../common/interfaces';
import { readFiles } from '../utils';

export const parseRoutes = (base: string): RoutingModule[] => {
  return parseReactRoutes(readFiles(base), {
    jsx: JsxEmit.React,
    allowJs: true
  });
};

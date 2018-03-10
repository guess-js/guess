export interface RoutingModule {
  path: string;
  modulePath: string;
  parentModulePath: string;
  lazy: boolean;
}

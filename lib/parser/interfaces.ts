export interface RoutingModule {
  path: string;
  module: string;
  parentModule: string;
  lazy: boolean;
}

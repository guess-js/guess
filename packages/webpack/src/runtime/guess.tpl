import { initialize } from './guess';

(function(g, graph, m, basePath, thresholds) {
  initialize(g, graph, m, basePath, thresholds);
})(typeof window === 'undefined' ? {} : window, <%= GRAPH %>, <%= GRAPH_MAP %>, <%= THRESHOLDS %>);

import { initialize } from './runtime';

(function(g, history, graph, m, basePath, thresholds) {
  initialize(g, history, graph, m, basePath, thresholds);
})(typeof window === 'undefined' ? global : window, (typeof window === 'undefined' ? {} : window).history || {}, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>);

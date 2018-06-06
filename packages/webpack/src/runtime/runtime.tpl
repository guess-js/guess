import { initialize } from './runtime';

(function(global, history, g, m, basePath, thresholds) {
  initialize(history, global, g, m, basePath, thresholds);
})(typeof window === 'undefined' ? global : window, (typeof window === 'undefined' ? global : window).history, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>);

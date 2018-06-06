import { initialize } from './guess';

(function(global, g, m, basePath, thresholds) {
  initialize(global, g, m, basePath, thresholds);
})(typeof window === 'undefined' ? global : window, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>);

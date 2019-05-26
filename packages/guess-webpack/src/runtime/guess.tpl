import { initialize } from './guess-aot';

(function(g, thresholds) {
  initialize(g, thresholds);
})(typeof window === 'undefined' ? global : window, <%= THRESHOLDS %>);

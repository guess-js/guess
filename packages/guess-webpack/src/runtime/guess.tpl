import { initialize } from './guess';

(function(g, thresholds) {
  initialize(g, thresholds);
})(typeof window === 'undefined' ? global : window, <%= THRESHOLDS %>);

import { initialize } from './guess-aot';

(function(g, thresholds, base) {
  initialize(g, thresholds, base);
})(typeof window === 'undefined' ? global : window, <%= THRESHOLDS %>, '<%= BASE_PATH %>');

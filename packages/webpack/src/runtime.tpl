(function(global, history, g, m, basePath, thresholds, delegate) {
  <%= CODE %>
  __GUESS__.initialize(history, global, g, m, basePath, thresholds, delegate);
  global.__GUESS__ = __GUESS__;
})(typeof window === 'undefined' ? global : window, (typeof window === 'undefined' ? global : window).history, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>, <%= DELEGATE %>);

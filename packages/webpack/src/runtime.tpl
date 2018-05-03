(function(history, g, m, basePath, thresholds, delegate) {
  <%= CODE %>
  __GUESS__.initialize(history, g, m, basePath, thresholds, delegate);
  window.__GUESS__ = __GUESS__;
})(window.history, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>, <%= DELEGATE %>);

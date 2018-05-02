(function(history, g, m, basePath, thresholds, delegate) {
  <%= CODE %>
  __GUESS__.initialize(history, g, m, basePath, thresholds, delegate);
})(window.history, <%= GRAPH %>, <%= GRAPH_MAP %>, '<%= BASE_PATH %>', <%= THRESHOLDS %>, <%= DELEGATE %>);

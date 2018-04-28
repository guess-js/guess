(function(history, basePath, g, m, thresholds) {
  <%= CODE %>
  __GUESS__.initialize(history, g, m, basePath, thresholds);
})(window.history, '<%= BASE_PATH %>', <%= GRAPH %>, <%= GRAPH_MAP %>, <%= THRESHOLDS %>);

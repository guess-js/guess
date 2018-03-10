(function(history, basepath, graph, thresholds) {
  const polyfillConnection = {
    effectiveType: '3g'
  };

  const matchRoute = (route, declaration) => {
    const routeParts = route.split('/');
    const declarationParts = declaration.split('/');
    if (routeParts.length > 0 && routeParts[routeParts.length - 1] === '') {
      routeParts.pop();
    }

    if (declarationParts.length > 0 && declarationParts[declarationParts.length - 1] === '') {
      declarationParts.pop();
    }

    if (routeParts.length !== declarationParts.length) {
      return false;
    } else {
      return declarationParts.reduce((a, p, i) => {
        if (p.startsWith(':')) {
          return a;
        }
        return a && p === routeParts[i];
      }, true);
    }
  };

  const handleNavigationChange = route => {
    const current = Object.keys(graph)
      .filter(matchRoute.bind(null, route))
      .pop();
    if (!current) {
      return;
    }
    const c = navigator.connection || polyfillConnection
    for (const route of graph[current]) {
      if (route.probability < thresholds[c.effectiveType]) {
        continue;
      }
      if (route.chunk) {
        console.log('Prefetchink', route.chunk);
        import(basepath + route.chunk);
      } else {
        console.log('Cannot find chunk for', route.route);
      }
    }
  };

  window.addEventListener('popstate', e => handleNavigationChange(location.pathname));

  const pushState = history.pushState;
  history.pushState = function(state) {
    if (typeof history.onpushstate == 'function') {
      history.onpushstate({ state: state });
    }
    handleNavigationChange(arguments[2]);
    return pushState.apply(history, arguments);
  };
})(window.history, '<%= BASE_PATH %>', <%= GRAPH %>, <%= THRESHOLDS %>);

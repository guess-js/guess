(function(history, basePath, g, m, thresholds) {
  class Node {
    constructor(node, map) {
      this.node = node;
      this.map = map;
    }

    get probability() {
      return this.node[0];
    }

    get route() {
      return this.map.routes[this.node[1]];
    }

    get chunk() {
      return this.map.chunks[this.node[2]];
    }
  }

  class Graph {
    constructor(graph, map) {
      this.graph = graph;
      this.map = map;
    }

    findMatch(route) {
      const result = this.graph.filter((_, i) => matchRoute(this.map.routes[i], route)).pop();
      if (!result) {
        return null;
      }
      return result.map(n => new Node(n, this.map));
    }
  }

  const graph = new Graph(g, m);
  const preFetched = {};
  const polyfillConnection = {
    effectiveType: '3g'
  };

  const support = function support(feature){
    const fakeLink = document.createElement('link');
    try {
      if (fakeLink.relList && typeof fakeLink.relList.supports === 'function') {
        return fakeLink.relList.supports(feature);
      }
    } catch (err){
      return false;
    }
  };

  const linkPrefetchStrategy = url => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'prefetch');
    link.setAttribute('href', url);
    const parentElement = document.getElementsByTagName('head')[0] || document.getElementsByName('script')[0].parentNode;
    parentElement.appendChild(link);
  };

  const importPrefetchStrategy = url => import(url);

  const supportedPrefetchStrategy = support('prefetch') ? linkPrefetchStrategy : importPrefetchStrategy;

  const prefetch = url => {
    url = basePath + url;
    if (preFetched[url]) {
      return;
    }
    console.log('Pre-fetching', url);
    preFetched[url] = true;
    supportedPrefetchStrategy(url);
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
    const nodes = graph.findMatch(route);
    if (!nodes) {
      return;
    }
    const c = navigator.connection || polyfillConnection;
    for (const node of nodes) {
      if (node.probability < thresholds[c.effectiveType] || preFetched[node.chunk]) {
        continue;
      }
      if (node.chunk) {
        prefetch(node.chunk);
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
})(window.history, '<%= BASE_PATH %>', <%= GRAPH %>, <%= GRAPH_MAP %>, <%= THRESHOLDS %>);

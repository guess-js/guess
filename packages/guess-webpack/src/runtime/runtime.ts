import { CompressedPrefetchGraph, CompressedGraphMap, PrefetchConfig } from '../declarations';
import { guess, initialize as initializeGuess } from './guess';

const support = (feature: string) => {
  if (typeof document === 'undefined') {
    return false;
  }
  const fakeLink = document.createElement('link') as any;
  try {
    if (fakeLink.relList && typeof fakeLink.relList.supports === 'function') {
      return fakeLink.relList.supports(feature);
    }
  } catch (err) {
    return false;
  }
};

const linkPrefetchStrategy = (url: string) => {
  if (typeof document === 'undefined') {
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', 'prefetch');
  link.setAttribute('href', url);
  const parentElement =
    document.getElementsByTagName('head')[0] || document.getElementsByName('script')[0].parentNode;
  parentElement.appendChild(link);
};

const importPrefetchStrategy = (url: string) => import(url);

const supportedPrefetchStrategy = support('prefetch')
  ? linkPrefetchStrategy
  : importPrefetchStrategy;

const preFetched: { [key: string]: boolean } = {};

const prefetch = (basePath: string, url: string) => {
  url = basePath + url;
  if (preFetched[url]) {
    return;
  }
  preFetched[url] = true;
  supportedPrefetchStrategy(url);
};

const handleNavigationChange = (basePath: string, path: string) => {
  const predictions = guess({ path });
  Object.keys(predictions).forEach(currentPath => {
    const chunk = predictions[currentPath].chunk;
    if (chunk) {
      prefetch(basePath, chunk);
    }
  });
};

export const initialize = (
  history: History,
  global: any,
  graph: CompressedPrefetchGraph,
  map: CompressedGraphMap,
  basePath: string,
  thresholds: PrefetchConfig
) => {
  initializeGuess(global, thresholds, graph, map);

  if (typeof global.addEventListener === 'function') {
    global.addEventListener('popstate', (e: any) =>
      handleNavigationChange(basePath, location.pathname)
    );
  }

  const pushState = history.pushState;
  history.pushState = function(state) {
    if (typeof (history as any).onpushstate === 'function') {
      (history as any).onpushstate({ state: state });
    }
    handleNavigationChange(basePath, arguments[2]);
    return pushState.apply(history, arguments as any);
  };
  handleNavigationChange(basePath, location.pathname);
};

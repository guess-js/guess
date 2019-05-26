import { PrefetchConfig } from '../declarations';

type ConnectionEffectiveType = '4g' | '3g' | '2g' | 'slow-2g';

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

const supportedPrefetchStrategy = support('prefetch')
  ? linkPrefetchStrategy
  : (url: string) => import(url);

const preFetched: { [key: string]: boolean } = {};

const prefetch = (basePath: string, url: string) => {
  url = basePath + url;
  if (preFetched[url]) {
    return;
  }
  preFetched[url] = true;
  supportedPrefetchStrategy(url);
};

const getConnection = (global: any): ConnectionEffectiveType => {
  if (!global.navigator || !global.navigator || !global.navigator.connection) {
    return '3g';
  }
  return global.navigator.connection.effectiveType || '3g';
};

export const initialize = (
  g: any,
  t: PrefetchConfig,
) => {
  const idle = g.requestIdleCallback || ((cb: Function) => setTimeout(cb, 0));
  g.__GUESS__ = {};
  g.__GUESS__.p = (...p: [string, number][]) => {
    idle(() => p.forEach(c => c[1] >= t[getConnection(g)] ? prefetch('', c[0]) : void 0))
  };
};

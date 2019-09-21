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
    document.head || document.getElementsByName('script')[0].parentNode;
  parentElement.appendChild(link);
};

const supportedPrefetchStrategy = support('prefetch')
  ? linkPrefetchStrategy
  : (url: string) => import(url);

const preFetched: { [key: string]: boolean } = {};

const prefetch = (basePath: string, url: string) => {
  if (basePath) {
    url = basePath + '/' + url;
  }
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

export const initialize = (g: any, t: PrefetchConfig, base?: string) => {
  const idle = g.requestIdleCallback || ((cb: Function) => setTimeout(cb, 0));
  g.__GUESS__ = {};
  g.__GUESS__.p = (...p: [number, string][]) => {
    idle(() =>
      p.forEach(c =>
        c[0] >= t[getConnection(g)]
          ? c.slice(1).forEach(f => prefetch(base || '', f as string))
          : void 0
      )
    );
  };
};

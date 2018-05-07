export const guess = (current: string, links?: string[]) =>
  ((typeof window === 'undefined' ? global : window) as any).__GUESS__.guess(current, links);

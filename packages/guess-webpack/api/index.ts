export const guess = (params: any) =>
  ((typeof window === 'undefined' ? global : window) as any).__GUESS__.guess(params);

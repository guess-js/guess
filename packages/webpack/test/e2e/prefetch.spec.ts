const puppeteer = require('puppeteer');

let browser: any;
let page: any;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

describe('GuessPlugin prefetch', () => {
  describe('manual predictions', () => {
    it('should export global __GUESS__', async () => {
      await page.goto('http://localhost:5122/prefetch/dist/index.html', { waitUntil: 'networkidle0' });

      const guessGlobal = await page.evaluate(() => {
        return !!(window as any).__GUESS__;
      });

      expect(guessGlobal).toBeTruthy();
    });

    it('should export make predictions', async () => {
      await page.goto('http://localhost:5122/prefetch/dist/index.html', { waitUntil: 'networkidle0' });

      const result = await page.evaluate(() => {
        return (window as any).__GUESS__.guess({ path: '/home' })['/about'].probability;
      });

      expect(result).toBe(1);
    });
  });

  describe('auto prefetching', () => {
    it('should prefetch on initial page load', async () => {
      await page.goto('http://localhost:5122/prefetch/dist/index.html', { waitUntil: 'networkidle0' });
      await page.click('a');
      expect((await page.$$('link[rel="prefetch"]')).length).toBe(1);
      await page.click('a:nth-of-type(2)');
      expect((await page.$$('link[rel="prefetch"]')).length).toBe(2);
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});

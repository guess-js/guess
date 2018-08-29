const puppeteer = require('puppeteer');

let browser: any;
let page: any;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

describe('GuessPlugin integration with Next.js', () => {
  describe('auto prefetching', () => {
    it('should prefetch on initial page load', async () => {
      await page.goto('http://localhost:5122/next/dist/', { waitUntil: 'networkidle0' });
      await page.waitForSelector('a:nth-of-type(3)');
      expect((await page.$$('script')).length).toBe(6);
      await page.goto('http://localhost:5122/next/dist/contact/', { waitUntil: 'networkidle0' });
      await page.waitForSelector('a:nth-of-type(3)');
      expect((await page.$$('script')).length).toBe(6);
    });
  });

  afterAll(async () => {
    await browser.close();
  });
});

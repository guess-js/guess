const puppeteer = require('puppeteer');

let browser: any;
let page: any;

beforeAll(async () => {
  browser = await puppeteer.launch();
  page = await browser.newPage();
});

describe('GuessPlugin delegate', () => {
  it('should export global __GUESS__', async () => {
    await page.goto('http://localhost:5122/delegate/dist/index.html', { waitUntil: 'networkidle0' });

    const guessGlobal = await page.evaluate(() => {
      return !!(window as any).__GUESS__;
    });

    expect(guessGlobal).toBeTruthy();
  });

  it('should export make predictions', async () => {
    await page.goto('http://localhost:5122/delegate/dist/index.html', { waitUntil: 'networkidle0' });

    const result = await page.evaluate(() => {
      return (window as any).__GUESS__.guess({ path: 'foo' }).bar;
    });

    expect(result).toBe(1);
  });

  afterAll(async () => {
    await browser.close();
  });
});

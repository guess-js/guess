// To run tests: $ npm run script-tests
// Server responses are stubbed, but test server needs to be running
// ($ NODE_ENV=test node ./fixtures/server.js)
// Mongod should be running
// Tests run against dist/client.js; to regenerate this: $ npm run build

const puppeteer = require('puppeteer')
const { expect } = require('chai')
const globalVariables = {'browser': global['browser'], 'expect': global['expect']}
const should = require('chai').should()

// TODO - Use config
const SERVER_URL = 'http://localhost:3000/'
const PAGE_URL = 'http://localhost:8080/test.html'

before(async () => {
  global.expect = expect
  global.browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    timeout: 10000
  })
})

after(() => {
  browser.close()
  global.browser = globalVariables.browser
  global.expect = globalVariables.expect
})

describe('Predictve fetching script ', function () {
  let page

  before(async function () {
    page = await browser.newPage()
    await page._client.send('Network.clearBrowserCookies')
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  })

  after(async function () {
    await page.close()
  })

  describe('makes a request', async function () {
    it('should have the correct request body', async function () {
      let requests = []

      page.on('request', interceptedRequest => {
        requests.push(interceptedRequest)
      })

      const unrelatedCookie = {
        'name': 'some_other_cookie',
        'value': 'abc',
        'domain': 'localhost',
        'path': '/test.html',
        'expires': (Date.now() / 1000) + 100
      }

      const cookie1 = {
        'name': 'pf_cookie1',
        'value': '111',
        'domain': 'localhost',
        'path': '/test.html',
        'expires': (Date.now() / 1000) + 100
      }

      const cookie2 = {
        'name': 'pf_cookie2',
        'value': '222',
        'domain': 'localhost',
        'path': '/test.html',
        'expires': (Date.now() / 1000) + 100
      }

      await page.setCookie(unrelatedCookie)
      await page.setCookie(cookie1)
      await page.setCookie(cookie2)

      await page.goto(PAGE_URL)

      request = requests.find(req => {
        let URL = SERVER_URL
        return req.url() === URL && req.method() === 'POST'
      })

      page.waitForNavigation({waitUntil: 'networkidle2'})
      expect(request).to.exist

      const actualResponseBody = JSON.parse(request.postData())
      expect(actualResponseBody['pagePath']).to.equal('/test.html')

      // not.be.empty (vs. a particular value like "4g" or "MacIntel")
      // is used so these tests will work cross-environment
      expect(actualResponseBody['clientInfo']['connectionType']).to.not.be.empty
      expect(actualResponseBody['clientInfo']['platform']).to.not.be.empty
      expect(actualResponseBody['clientInfo']['language']).to.not.be.empty

      expect(actualResponseBody['userFlow'].length).to.equal(2)
      expect(actualResponseBody['userFlow']).to.contain('pf_cookie1=111')
      expect(actualResponseBody['userFlow']).to.contain('pf_cookie2=222')
    })
  })

  describe('request callback', function () {
    const setupResponse = async (page, responseBody) => {
      await page.setRequestInterception(true)
      page.on('request', req => {
        if (req.url() === SERVER_URL && req.method() === 'POST') {
          req.respond({
            status: 200,
            contentType: 'application/json',
            headers: {'Access-Control-Allow-Origin': '*'},
            body: JSON.stringify(responseBody)
          })
        } else {
          req.continue()
        }
      })
    }
    before(async function () {
      page = await browser.newPage()
      setupResponse(page, {'pageViewId': '123', 'prefetchPath': ''})
      await page._client.send('Network.clearBrowserCookies')
      await page.goto(PAGE_URL)
      await page.waitFor(100)
    })
    describe("when there's no matching prefetch", function () {
      it('should not append a link', async function () {
        const link = await page.evaluate(() => {
          return document.querySelector('link')
        })
        expect(link).to.be.null
      })
      it('should set prefetch cookies', async function () {
        const cookies = await page.cookies()
        expect(cookies.length).to.equal(1)
        expect(cookies[0].name).to.equal('pf_123')

        const currentTime = new Date() / 1000
        // Buffer user to account for slight timestamp difference
        // between when cookie was created and when this test runs
        const buffer = 5
        const cookieValue = parseInt(cookies[0].value)
        expect(cookieValue).to.be.closeTo(currentTime, buffer)

        const cookieMaxAge = 300
        expect(cookies[0].expires).to.be.closeTo(currentTime + cookieMaxAge, buffer)
      })
    })
    describe("when there's a matching prefetch", function () {
      before(async function () {
        page = await browser.newPage()
        setupResponse(page, {'pageViewId': '123', 'prefetchPath': '/nextpage.html'})
        await page._client.send('Network.clearBrowserCookies')
        await page.goto(PAGE_URL)
        await page.waitFor('link')
      })

      it('should append a link', async function () {
        const link = await page.evaluate(() => {
          return document.querySelector('link')
        })
        expect(link).to.exist
      })

      it('should use prefetch', async function () {
        const resourceHint = await page.evaluate(() => {
          return document.querySelector('link').rel
        })
        expect(resourceHint).to.equal('prefetch')
      })

      it('should load the correct resource', async function () {
        const href = await page.evaluate(() => {
          return document.querySelector('link').href
        })
        // Regex matches that "/nextpage.html" apears at the end of the string
        expect(href).to.match(/\/nextpage\.html$/)
      })

      it('should set prefetch cookies', async function () {
        const cookies = await page.cookies()

        expect(cookies[0].name).to.equal('pf_123')

        const currentTime = new Date() / 1000
        // Buffer user to account for slight timestamp difference
        // between when cookie was created and when this test runs
        const buffer = 5
        const cookieValue = parseInt(cookies[0].value)
        expect(cookieValue).to.be.closeTo(currentTime, buffer)

        const cookieMaxAge = 300
        expect(cookies[0].expires).to.be.closeTo(currentTime + cookieMaxAge, buffer)
      })
    })
  })
})

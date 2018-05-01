const mongoose = require('mongoose')
const Prediction = require('./models/prediction')
const config = require('../config')

// Generates & saves predictions based off Google Analytics response
const saveReports = async (reports) => {
  let [report] = reports
  let {rows} = report.data
  const data = {}

  for (let row of rows) {
    let [previousPagePath, pagePath] = row.dimensions
    let pageviews = +row.metrics[0].values[0]
    let exits = +row.metrics[0].values[1]

    if (/\?.*$/.test(pagePath) || /\?.*$/.test(previousPagePath)) {
      pagePath = pagePath.replace(/\?.*$/, '')
      previousPagePath = previousPagePath.replace(/\?.*$/, '')
    }

    // Ignore pageviews where the current and previous pages are the same.
    if (previousPagePath == pagePath) continue

    if (previousPagePath != '(entrance)') {
      data[previousPagePath] = data[previousPagePath] || {
        pagePath: previousPagePath,
        pageviews: 0,
        exits: 0,
        nextPageviews: 0,
        nextExits: 0,
        nextPages: {}
      }

      data[previousPagePath].nextPageviews += pageviews
      data[previousPagePath].nextExits += exits

      if (data[previousPagePath].nextPages[pagePath]) {
        data[previousPagePath].nextPages[pagePath] += pageviews
      } else {
        data[previousPagePath].nextPages[pagePath] = pageviews
      }
    }

    data[pagePath] = data[pagePath] || {
      pagePath: pagePath,
      pageviews: 0,
      exits: 0,
      nextPageviews: 0,
      nextExits: 0,
      nextPages: {}
    }

    data[pagePath].pageviews += pageviews
    data[pagePath].exits += exits
  }

  // Converts each pages `nextPages` object into a sorted array.
  Object.keys(data).forEach((pagePath) => {
    const page = data[pagePath]
    page.nextPages = Object.keys(page.nextPages)
      .map((pagePath) => ({
        pagePath,
        pageviews: page.nextPages[pagePath]
      }))
      .sort((a, b) => b.pageviews - a.pageviews)
  })

  // Creates a sorted array of pages from the data object.
  const pages = Object.keys(data)
    .filter((pagePath) => data[pagePath].nextPageviews > 0)
    .map((pagePath) => {
      const page = data[pagePath]
      const {exits, nextPageviews, nextPages} = page
      page.percentExits = exits / (exits + nextPageviews)
      page.topNextPageProbability =
                nextPages[0].pageviews / (exits + nextPageviews)
      return page
    })
    .sort((a, b) => {
      // return b.topNextPageProbability - a.topNextPageProbability
      return b.pageviews - a.pageviews
    })
  for (let page of pages) {
    // TODO - remove console logs
    console.log(page)
    console.log('\n')
  }

  await savePagesToDatabase(pages)
}

// Adds each page (and its associated prediction) to the database.
// If a page already exists, its record is updated based on the most recent Google Analytics data.
const savePagesToDatabase = async (pages) => {
  mongoose.connect(config.db.mongoURL)
  for (let page of pages) {
    const prediction = {
      pagePath: page.pagePath,
      nextPagePath: page.nextPages[0] ? page.nextPages[0].pagePath : '',
      nextPageCertainty: page.nextPages[0] ? page.topNextPageProbability : ''
    }
    await Prediction.update({'pagePath': prediction.pagePath}, prediction, {'upsert': true})
  }
}

module.exports = {saveReports: saveReports}

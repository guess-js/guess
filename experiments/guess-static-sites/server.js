const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const Prediction = require('./src/models/prediction')
const PageView = require('./src/models/pageView')
const config = require('./config')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.all('/', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
  next()
})

const certaintyThresholdsByConnectionType = {
  'slow-2g': 0.95,
  '2g': 0.9,
  '3g': 0.5,
  '4g': 0.2
}

const shouldPrefetch = function (request, prediction) {
  if (prediction === null) { return false }
  if (request.header('Save-Data')) { return false }
  const connectionType = request.body.clientInfo.connectionType
  const threshold = certaintyThresholdsByConnectionType[connectionType]
  if (threshold === undefined) {
    return false
  } else {
    return parseFloat(prediction.nextPageCertainty) > parseFloat(threshold)
  }
}

const getPreviousPageId = function (cookies) {
  let latestTimestamp = 0
  let latestId
  cookies.forEach(c => {
    const timestamp = parseInt(c.split('=')[1])
    if (timestamp > latestTimestamp) {
      latestTimestamp = timestamp
      latestId = c.substring(c.indexOf('_') + 1, c.indexOf('='))
    }
  })
  return latestId
}

app.post('/', async (req, res) => {
  mongoose.connect(config.db.mongoURL)
  const prediction = await Prediction.findOne({'pagePath': req.body['pagePath']})
  const prefetchPath = shouldPrefetch(req, prediction) ? prediction['nextPagePath'] : ''

  const pageView = await PageView.create({
    pagePath: req.body['pagePath'],
    clientInfo: req.body['clientInfo'],
    userFlow: req.body['userFlow'],
    prefetchPath: prefetchPath
  })

  // Update data about previous page view
  if (req.body.userFlow.length > 0) {
    const id = getPreviousPageId(req.body.userFlow)
    await PageView.findByIdAndUpdate(id, {'actualNextPagePath': req.body.pagePath})
  }

  res.json({
    'pageViewId': pageView._id,
    'prefetchPath': prefetchPath
  })
})

app.listen(config.server.port)

module.exports = app

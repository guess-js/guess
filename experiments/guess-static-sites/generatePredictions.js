/*
This scripts retrieves recent reporting data from Google Analytics
and uses this to determine the "Most Likely Next Page" for each page on your site.
This data is saved in Mongo.
*/
const {google} = require('googleapis')
const fs = require('fs')
const queryParams = require('./src/queryParams')
const parser = require('./src/parser')
const config = require('./config')
const path = require('path')

const authClient = new google.auth.JWT({
  email: config.auth.serviceAccountEmail,
  key: fs.readFileSync(path.join(__dirname, config.auth.keyFileName), 'utf8'),
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
})

const getData = async (authClient) => {
  await authClient.authorize()
  const analytics = google.analyticsreporting({
    version: 'v4',
    auth: authClient
  })
  const response = await analytics.reports.batchGet(queryParams)
  await parser.saveReports(response.data.reports)
  process.exit()
}

getData(authClient)

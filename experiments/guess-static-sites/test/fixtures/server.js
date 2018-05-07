// Simple static server for serving a page for testing front-end script
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 8080

app.use(cors())

app.get('/test.html', function (req, res) {
  res.sendFile(path.join(__dirname + '/test.html'))
})

app.get('/predictiveFetching.js', async (req, res) => {
  fs.readFile(path.join(__dirname + '/../../predictiveFetching.js'), 'utf8', (err, data) => {
    const response = data.replace(/http:\/\/YOUR_SERVER_ENDPOINT\//g, 'http://localhost:3000/')
    res.send(response)
  })
})

app.listen(PORT, function () {
  console.log('Test web server listening on port ' + PORT)
})

// To run tests: $ npm run generate-predictions-tests
// mongod should be running

const chai = require('chai')
const expect = chai.expect

const mongoose = require('mongoose')
const config = require('../config')

const parser = require('../src/parser')
const fakeResponse = require('./fixtures/gaResponse.json')
const Prediction = require('../src/models/prediction')

describe('#SaveReports', function () {
  beforeEach(async () => {
    await mongoose.connect(config.db.mongoURL)
    await mongoose.connection.db.dropDatabase()
  })
  afterEach(async () => {
    mongoose.disconnect()
  })
  it('should save API response as predictions', async () => {
    await parser.saveReports(fakeResponse['testData'])

    const predictions = await Prediction.find({})
  	expect(await predictions.length).to.equal(4)

  	const prediction1 = predictions.find((p) => { return p.pagePath === '/page/turtles/' })
  	expect(prediction1.nextPageCertainty).to.equal(0.1875)
  	expect(prediction1.nextPagePath).to.equal('/turtles/turtle1.html')

  	const prediction2 = predictions.find((p) => { return p.pagePath === '/page/dogs/' })
  	expect(prediction2.nextPageCertainty).to.equal(0.14285714285714285)
  	expect(prediction2.nextPagePath).to.equal('/dogs/dog_photo2.html')
  })
})

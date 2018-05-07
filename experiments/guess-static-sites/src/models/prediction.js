const mongoose = require('mongoose')

const predictionSchema = mongoose.Schema({
  pagePath: String,
  nextPagePath: String,
  nextPageCertainty: Number
})
const Prediction = mongoose.model('Prediction', predictionSchema)

module.exports = Prediction

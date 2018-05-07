const mongoose = require('mongoose')

const pageViewSchema = mongoose.Schema({
  pagePath: String,
  clientInfo: Object,
  userFlow: Array,
  prefetchPath: String,
  actualNextPagePath: String
})
const PageView = mongoose.model('PageView', pageViewSchema)

module.exports = PageView

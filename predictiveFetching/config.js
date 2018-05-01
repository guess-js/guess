const env = process.env.NODE_ENV

require('dotenv').config()

const dev = {
  auth: {
    keyFileName: 'key.pem',
    viewID: process.env.VIEW_ID,
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL
  },
  db: {
    mongoURL: 'mongodb://localhost:27017/guessjs_dev'
  },
  server: {
    port: 3000,
    url: 'http://localhost:3000'
  }
}

const test = {
  auth: {
    keyFileName: 'key.pem',
    viewID: process.env.VIEW_ID,
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL
  },
  db: {
    mongoURL: 'mongodb://localhost:27017/guessjs_test'
  },
  server: {
    port: 3000,
    url: 'http://localhost:3000'
  }
}

const prod = {
  auth: {
    keyFileName: 'key.pem',
    viewID: process.env.VIEW_ID,
    serviceAccountEmail: process.env.SERVICE_ACCOUNT_EMAIL
  },
  db: {
    mongoURL: 'mongodb://localhost:27017/guessjs_prod'
  },
  server: {
    port: 3000,
    url: 'http://localhost:3000'
  }
}

const config = {
  dev,
  test,
  prod
}

module.exports = config[env] || config['dev']

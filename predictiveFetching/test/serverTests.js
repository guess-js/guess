// $ npm run server-tests
const request = require('supertest')
const express = require('express')
const chai = require('chai')
const mongoose = require('mongoose')

const Prediction = require('../src/models/prediction')
const PageView = require('../src/models/pageView')

const expect = chai.expect
const app = require('../server.js')

const config = require('../config')

describe('POST /', function () {
  beforeEach(async () => {
    await mongoose.connect(config.db.mongoURL)
    await mongoose.connection.db.dropDatabase()
  })
  afterEach(async () => {
    mongoose.disconnect()
  })
  describe('response', function () {
    describe('when a prediction for that page exists in the database', async () => {
      const makeRequest = function () {
        return request(app)
          .post('/')
          .send({
            pagePath: '/page/1',
            userFlow: ['pf_123', 'pf_456'],
            clientInfo: {
              connectionType: '4g',
              platform: 'MacIntel',
              language: 'en-US'
            }
          })
      }
      beforeEach(async () => {
        await Prediction.create({
          pagePath: '/page/1',
          nextPagePath: '/page/2',
          nextPageCertainty: 0.75
        })
      })
      it('should create a new PageView record', async () => {
        await makeRequest()
        const pageView = await PageView.findOne({})

        expect(pageView.pagePath).to.equal('/page/1')

        expect(pageView.clientInfo.connectionType).to.equal('4g')
        expect(pageView.clientInfo.platform).to.equal('MacIntel')
        expect(pageView.clientInfo.language).to.equal('en-US')

        expect(pageView.userFlow[0]).to.equal('pf_123')
        expect(pageView.userFlow[1]).to.equal('pf_456')

        expect(pageView.prefetchPath).to.equal('/page/2')
        expect(pageView.actualNextPagePath).to.equal(undefined)
      })
      it('should have the correct response body', async () => {
        const response = await makeRequest()
        const pageView = await PageView.findOne({pagePath: '/page/1'})
        expect(response.body['pageViewId']).to.equal(pageView._id.toString())
        expect(response.body['prefetchPath']).to.equal('/page/2')
        expect(200)
      })
    })
    describe('when a prediction for that page does not exist in the database', async () => {
      const makeRequest = function () {
        return request(app)
          .post('/')
          .send({
            pagePath: '/no/matches',
            userFlow: [],
            clientInfo: {
              connectionType: '4g'
            }
          })
      }
      it('should create a new PageView record', async () => {
        await makeRequest()

        const pageView = await PageView.findOne({})
        expect(pageView.prefetchPath).to.equal('')

        expect(pageView.pagePath).to.equal('/no/matches')
        expect(pageView.clientInfo.connectionType).to.equal('4g')
        expect(pageView.userFlow.length).to.equal(0)
        expect(pageView.actualNextPagePath).to.equal(undefined)
      })
      it('should have the correct response body', async () => {
        const response = await makeRequest()
        const pageView = await PageView.findOne({pagePath: '/no/matches'})
        expect(response.body['pageViewId']).to.equal(pageView._id.toString())
        expect(response.body['prefetchPath']).to.equal('')
        expect(200)
      })
    })
  })
  describe('using connectionType to determine whether page should be prefetched', async () => {
    const makeRequestOnConnectionType = function (connectionType) {
      return request(app)
        .post('/')
        .send({
          pagePath: '/page/1',
          userFlow: ['pf_123', 'pf_456'],
          clientInfo: {
            connectionType: connectionType,
            platform: 'MacIntel',
            language: 'en-US'
          }
        })
    }
    beforeEach(async () => {
      await Prediction.create({
        pagePath: '/page/1',
        nextPagePath: '/page/2',
        nextPageCertainty: 0.75
      })
    })
    describe('when client is on a fast connection', async () => {
      it('should respond with a page to prefetch', async () => {
        const response = await makeRequestOnConnectionType('4g')
        expect(response.body['prefetchPath']).to.equal('/page/2')
        expect(200)
      })
    })
    describe('when client is on a slow connection', async () => {
      it('should not respond with a page to prefetch', async () => {
        const response = await makeRequestOnConnectionType('slow-2g')
        expect(response.body['prefetchPath']).to.equal('')
        expect(200)
      })
    })
    describe('when client is on an unknown connection', async () => {
      it('should not respond with a page to prefetch', async () => {
        const response = await makeRequestOnConnectionType('foobar')
        expect(response.body['prefetchPath']).to.equal('')
        expect(200)
      })
    })
    describe('when client is using Save-Data header', async () => {
      it('should not respond with a page to prefetch', async () => {
        const response = await request(app)
          .post('/')
          .set('Save-Data', true)
          .send({
            pagePath: '/page/1',
            userFlow: ['pf_123', 'pf_456'],
            clientInfo: {
              connectionType: '4g',
              platform: 'MacIntel',
              language: 'en-US'
            }
          })
        expect(response.body['prefetchPath']).to.equal('')
        expect(200)
      })
    })
  })
  describe('previous pageviews', async () => {
    it('updates existing previous page record', async () => {
      const existingPageView = await PageView.create({
        pagePath: '/old.html',
        clientInfo: {
          connectionType: '3g'
        },
        userFlow: [],
        prefetchPath: '',
        actualNextPagePath: ''
      })
      await request(app)
        .post('/')
        .send({
          pagePath: '/this/page',
          userFlow: ['pf_5ad567927c8db21eec4ae909=1523890000', 'pf_' + existingPageView._id + '=1523891234'],
          clientInfo: {
            connectionType: '4g'
          }
        })
      const updatedRecord = await PageView.findById(existingPageView._id)
      expect(updatedRecord.actualNextPagePath).to.equal('/this/page')
    })
  })
})

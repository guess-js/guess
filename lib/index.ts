import { normalize } from './normalize';
import { Connection } from './network';
import { dbStorage } from './store';

const { readFileSync } = require('fs');

const { google } = require('googleapis');
const key = require('../credentials.json');
const viewID = readFileSync('./view_id.txt').toString();

const db = dbStorage('db');

let jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/analytics.readonly'],
  null
);

jwtClient.authorize(function(err: any, tokens: any) {
  if (err) {
    console.log(err);
    return;
  }
  let analytics = google.analyticsreporting('v4');
  queryData(analytics);
});

function queryData(analytics: any) {
  analytics.reports.batchGet(
    {
      auth: jwtClient,
      resource: {
        reportRequests: {
          pageSize: 1000,
          viewId: `ga:${viewID}`,
          dateRanges: [
            {
              startDate: '2017-02-21',
              endDate: '2018-02-21'
            }
          ],
          dimensions: [{ name: 'ga:previousPagePath' }, { name: 'ga:pagePath' }],
          metrics: [{ expression: 'ga:users' }],
          orderBys: [{ fieldName: 'ga:users', sortOrder: 'DESCENDING' }]
        }
      }
    },
    function(err: any, response: any) {
      if (err) {
        console.log(err);
        return;
      }
      db
        .save(normalize(response.data.reports[0].data))
        .then(() => {
          console.log('Stored');
          db
            .query('/2016/01/23/angular2-viewchildren-contentchildren-difference-viewproviders/')
            .then(data => {
              console.log(data);
            })
            .catch(e => {
              console.error(e);
            });
        })
        .catch(e => console.error(e));
    }
  );
}

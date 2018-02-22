const { readFileSync } = require('fs');

const { google } = require('googleapis');
const key = require('../credentials.json');
const viewID = readFileSync('./view_id.txt').toString();

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
      console.log(JSON.stringify(response.data.reports[0], null, 2));
    }
  );
}

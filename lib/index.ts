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
          viewId: `ga:${viewID}`,
          dimensions: [{ name: 'ga:pagePath' }],
          metrics: [{ expression: 'ga:uniquePageviews' }]
        }
      }
    },
    function(err: any, response: any) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(response);
    }
  );
}

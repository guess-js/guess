function requestBuilder(jwtClient: any, viewId: string, pageConfig: PageConfig) {
  const result = {
    auth: jwtClient,
    resource: {
      reportRequests: {
        pageSize: pageConfig.pageSize,
        pageToken: pageConfig.pageToken,
        viewId: `ga:${viewId}`,
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
  };
  return result;
}

interface PageConfig {
  pageToken: number;
  pageSize: number;
}

interface AnalyticsResult {
  report: any;
  nextPage: number;
}

async function fetchReport(client: any, jwtClient: any, viewId: string, pageConfig: PageConfig) {
  return new Promise<AnalyticsResult>((resolve, reject) => {
    client.reports.batchGet(requestBuilder(jwtClient, viewId, pageConfig), function(err: any, response: any) {
      if (err) {
        reject(err);
        return;
      }
      const nextPage = response.data.reports[0].nextPageToken;
      const report = response.data.reports[0];
      resolve({
        report,
        nextPage
      });
    });
  });
}

(Symbol as any).asyncIterator = (Symbol as any).asyncIterator || Symbol('Symbol.asyncIterator');

export type GaResult = any;

export interface ClientResult {
  error?: GaResult;
  report?: any;
}

export function getClient(jwtClient: any, pageSize: number, viewId: string) {
  const { google } = require('googleapis');
  const client = google.analyticsreporting('v4');
  const pageConfig: PageConfig = {
    pageSize,
    pageToken: undefined
  };

  async function* reportGenerator(): AsyncIterableIterator<ClientResult> {
    while (true) {
      const clientResult: ClientResult = {};
      try {
        const result = await fetchReport(client, jwtClient, viewId, pageConfig);
        clientResult.report = result.report;
        if (result.nextPage) {
          pageConfig.pageToken = result.nextPage;
        } else {
          break;
        }
      } catch (e) {
        clientResult.error = e;
      }
      yield clientResult;
    }
  }

  return reportGenerator;
}

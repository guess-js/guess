import { Period } from '../../common/interfaces';

interface PageConfig {
  pageToken: number | undefined;
  pageSize: number;
}

interface AnalyticsResult {
  report: any;
  nextPage: number;
}

const formatNumber = (n: number) => (n.toString().length === 1 ? '0' + n : n);

const formatDate = (d: Date) => `${d.getFullYear()}-${formatNumber(d.getMonth() + 1)}-${formatNumber(d.getDate())}`;

function requestBuilder(jwtClient: any, viewId: string, pageConfig: PageConfig, period: Period, expression: string) {
  return {
    auth: jwtClient,
    resource: {
      reportRequests: {
        pageSize: pageConfig.pageSize,
        pageToken: pageConfig.pageToken,
        viewId,
        dateRanges: [
          {
            startDate: formatDate(period.startDate),
            endDate: formatDate(period.endDate)
          }
        ],
        dimensions: [{ name: 'ga:previousPagePath' }, { name: 'ga:pagePath' }],
        metrics: [{ expression }],
        orderBys: [{ fieldName: expression, sortOrder: 'DESCENDING' }]
      }
    }
  };
}

async function fetchReport(
  client: any,
  jwtClient: any,
  viewId: string,
  pageConfig: PageConfig,
  period: Period,
  expression: string
) {
  return new Promise<AnalyticsResult>((resolve, reject) => {
    client.reports.batchGet(requestBuilder(jwtClient, viewId, pageConfig, period, expression), function(
      err: any,
      response: any
    ) {
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

export function getClient(jwtClient: any, pageSize: number, viewId: string, period: Period, expression: string) {
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
        const result = await fetchReport(client, jwtClient, viewId, pageConfig, period, expression);
        clientResult.report = result.report;
        if (result.nextPage) {
          pageConfig.pageToken = result.nextPage;
        }
      } catch (e) {
        clientResult.error = e;
      }
      yield clientResult;
      if (!pageConfig.pageToken) {
        break;
      }
    }
  }

  return reportGenerator;
}

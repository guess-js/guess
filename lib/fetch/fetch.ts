import { getClient, Period } from './client';
import { normalize } from './normalize';
import { Connection } from '../store';
import { dbStorage } from '../store';

const PageSize = 1000;

async function fetchData(jwtClient: any, viewId: string, period: Period) {
  const client = getClient(jwtClient, PageSize, viewId, period);
  const db = dbStorage(viewId.toString());
  for await (const val of client()) {
    if (val.error) {
      throw val.error;
    }
    const result = val.report;
    if (result) {
      await db.save(normalize(result.data));
    }
  }
}

export function fetch(key: any, viewId: string, period: Period): Promise<void> {
  return new Promise((resolve, reject) => {
    const { google } = require('googleapis');

    const jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/analytics.readonly'],
      null
    );

    jwtClient.authorize(function(err: any, tokens: any) {
      if (err) {
        reject(err);
        return;
      }
      fetchData(jwtClient, viewId, period).then(resolve, reject);
    });
  });
}

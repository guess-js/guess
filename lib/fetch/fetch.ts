import { getClient } from './client';
import { normalize } from './normalize';
import { Connection } from '../store';
import { dbStorage } from '../store';

async function fetchData(jwtClient: any, viewId: string) {
  const client = getClient(jwtClient, 10, viewId);
  const db = dbStorage(viewId.toString());
  for await (const val of client()) {
    if (val.error) {
      console.error(val.error);
      break;
    }
    const result = val.report;
    if (result) {
      await db.save(normalize(result.data));
    }
  }
}

export function fetch(key: any, viewId: string): Promise<void> {
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
      fetchData(jwtClient, viewId).then(resolve, reject);
    });
  });
}

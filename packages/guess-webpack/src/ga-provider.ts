import { auth as oauth2 } from 'google-oauth2-node';
import { RoutingModule, Period, Graph } from '../../common/interfaces';
import { fetch } from 'guess-ga';

const clientId = '329457372673-hda3mp2vghisfobn213jpj8ck1uohi2d.apps.googleusercontent.com';
const clientSecret = '4camaoQPOz9edR-Oz19vg-lN';
const scope = 'https://www.googleapis.com/auth/analytics.readonly';
const year = 365 * 24 * 60 * 60 * 1000;

const flatCache = require('flat-cache');
const cache = flatCache.load('guess-plugin');

const id = <T>(r: T) => r;

export interface Config {
  jwt?: any;
  viewId: string;
  routes: RoutingModule[];
  formatter?: (path: string) => string;
  period?: Period;
}

const serializePeriod = (period: Period) => `${period.startDate.getTime()}-${period.endDate.getTime()}`;

export const getReport = (c: Config): Promise<Graph> => {
  const period = c.period || { startDate: new Date(Date.now() - year), endDate: new Date() };
  const key = `${c.viewId}-${serializePeriod(period)}`;
  const report = cache.getKey(key);
  if (report) {
    return Promise.resolve(JSON.parse(report));
  }
  const { google } = require('googleapis');
  let client: Promise<{}>;
  if (!c.jwt) {
    client = oauth2({
      clientId,
      clientSecret,
      scope
    }).then((token: any) => {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(token);
      return oauth2Client;
    });
  } else {
    client = Promise.resolve(new google.auth.JWT(c.jwt.client_email, null, c.jwt.private_key, [scope], null));
  }
  return client
    .then((auth: any) => {
      return fetch({
        viewId: c.viewId,
        auth,
        period: period,
        routes: c.routes.map(r => r.path),
        formatter: c.formatter || id
      });
    })
    .then(g => {
      cache.setKey(key, JSON.stringify(g));
      cache.save();
      return g;
    });
};

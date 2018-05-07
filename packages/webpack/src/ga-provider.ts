import { auth } from 'google-oauth2-node';
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
  viewId: string;
  routes: RoutingModule[];
  formatter?: (path: string) => string;
  period?: Period;
}

const serializePeriod = (period: Period) => `${period.startDate.getTime()}-${period.endDate.getTime()}`;

export const getReport = (c: Config): Promise<Graph> => {
  const period = c.period || { startDate: new Date(), endDate: new Date(Date.now() - year) };
  const key = `${c.viewId}-${serializePeriod(period)}`;
  const report = cache.getKey(key);
  if (report) {
    return Promise.resolve(JSON.parse(report));
  }
  return auth({
    clientId,
    clientSecret,
    scope
  })
    .then((token: any) => {
      const { google } = require('googleapis');
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials(token);

      return fetch({
        viewId: c.viewId,
        auth: oauth2Client,
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

# GA

Fetches data from Google analytics.

## Setup

### Create Your Credentials

#### i) Create a Service Account

1. Go to the [Credentials](https://console.developers.google.com/apis/credentials) page in the Google APIs console. 

2. If you don't have an existing Google Cloud project, click "Create" to create a new project. Otherwise, use the dropdown in the upper left corner to select the existing project that you'd like to use.

3. Select "Service Account key" from the "Create credentials" dropdown.

4. Fill out the form for creating a service account key:
- **Service account dropdown:** Select "New Service Account".
- **Service account name:** Give your service account a name.
- **Role:** Select "Service Account User" ("Service Accounts" > "Service Account User").
- **Service account ID:** This field will automatically be pre-filled, but you can change this if you would like.
- **Key type:** Select JSON key.

*This should start a download of the credentials file*

### Configure Google Analytics

#### i) Add service account to Google Analytics
The service account that you just created needs to be added as a user to your Google analytics account.
1. Login to your [Google Analytics](https://analytics.google.com/analytics/web/) account.
2. Add a new user. (Admin > User Management > + > Add New Users)
- **Email Address** The email address of the service account you created. It should look something like this: example@example-project-123456.iam.gserviceaccount.com.
- **Permissions:** Select "Read & Analyze."

*Note: A service account can only be associated with one Google Analytics account at a time. Thus, if you want to use predictive fetching on multiple sites, you'll need to create a separate service account for each.*

#### ii) Enable the Google Analytics Reporting API
You can enable this [here.](https://console.developers.google.com/flows/enableapi?apiid=analyticsreporting.googleapis.com&credential=client_key)

### Set up credentials

To use the credentials in your project, copy it your project,
and make sure to add it or its folder to gitignore.
You can also opt to take `client_email` and `private_key` from the credentials file, and add them to env.

### Get your view ID
To find your view ID, go to [Google Analytics](https://analytics.google.com/analytics/web/).
Click the accounts dropdown (it's located in the upper lefthand corner  of the screen, right next to the Google Analytics logo). The dialog that opens will have three columns: Analytics Accounts, Properties & Apps, & Views. The far right column ("Views") will contain the View ID for your site.

You can opt to save this in an .env file if you do not want to share this information.

## Usage

```bash
npm i guess-ga
```

Combined with `guess-parser` you can aggregate the route information and map it to your application's parametrized routes:

```ts
const { fetch } = require('guess-ga');
const { parseRoutes, ProjectType } = require('guess-parser');
const { JWT } = require('google-auth-library');
const { writeFileSync } = require('fs');

const credentials = require('./secret/credentials.json');

const auth = new JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/analytics.readonly']
);

const viewId = '000000000';

const applicationRoutes = parseRoutes('tsconfig.app.json', ProjectType.Angular);

fetch({
  auth,
  viewId,
  period: {
    startDate: new Date('2018-1-1'),
    endDate: new Date(Date.now())
  },
  formatter: r => r.replace('/app', ''),
  routes: applicationRoutes.map(f => f.path)
}).then(g => {
  writeFileSync('data.json', JSON.stringify(g, null, 2));
});
```

For more details visit [https://github.com/guess-js/guess](https://github.com/guess-js/guess).

## License

MIT

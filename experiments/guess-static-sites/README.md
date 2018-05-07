# guess-static-sites

Guess.js for non-Webpack sites.

*Automatic, dynamic, intelligent prefetching for faster page loads.*

:heavy_check_mark: **Automatic:** Once you've setup predictive fetching you'll automatically be using it on all your pages. (No more forgetting to take advantage of prefetch.)

:heavy_check_mark: **Dynamic:** As your site changes, prefetch links will adjust accordingly. (No more hardcoded prefetch URLs.) 

:heavy_check_mark: **Intelligent:** Predictive fetching uses the client's connection type to determine whether a resource should be prefetched.
<br></br>

## How guess-static-sites works
This directory uses Google Analytics data to determine which page a user is mostly likely to visit next from a given page (***generatePredictions.js***).

A client-side script (which you'll add to your application) sends a request to the server you are running to get the URL of the page it should fetch, it then prefetches this resource (***script.js & server.js***).

If a user is on a poor connection, prefetching will only occur if there's a high level of certainty that a user will go to a particular page next. If a client is using the Save-Data header, no prefetching will occur.

## Setup
After downloading the Guess.js repo, cd to this directory and install the dependencies:
```
$ cd experiments/guess-static-sites
$ npm install
```

## A) Server setup
Use this command to run the server:
```
$ node server.js
```

## B) Script setup
1. Add predictiveFetching.js to your pages.
2. In predictiveFetching.js, replace ```'http://YOUR_SERVER_ENDPOINT/'``` with the server endpoint you'll be using.


## C) Database setup

**Prerequisites:**
- A Google Analytics account
- Mongo installed on your computer/server [(Instructions)](https://docs.mongodb.com/manual/installation/)

This is the final, and lengthiest, part of the setup process - but it should only take about 5-10 minutes to complete if you already have Mongo and a Google Analytics account. Afterwards you'll be ready to consume and analyze your Google Analytics data.

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
- **Key type:** Select P12 key.

5. Click Create.

#### ii) Setup Your Private Key

Your private key should have started downloading when you clicked the "Create" button for creating your service account.
1. Note the private key password. You'll be prompted for this password in Step 3.
2. Move this key into the directory for this project.
3. Generate a *.p12 certificate by running this command from the directory for this project: 
```
$ openssl pkcs12 -in *.p12 -out key.pem -nodes -clcerts
```

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

### Create your .env file

This file will hold your confidential configuration details.

#### i) Create the file

```
$ touch .env
```

#### ii) Add your information
Your file should look like this (replace with your own values):

```bash
VIEW_ID=12345678
SERVICE_ACCOUNT_EMAIL=example@example-project-123456.iam.gserviceaccount.com
```

To find your view ID, go to [Google Analytics](https://analytics.google.com/analytics/web/).
Click the accounts dropdown (it's located in the upper lefthand corner  of the screen, right next to the Google Analytics logo). The dialog that opens will have three columns: Analytics Accounts, Properties & Apps, & Views. The far right column ("Views") will contain the View ID for your site.

### Generate predictions

#### i) Start mongod
If mongod is not running, start it:
```
$ mongod
```

#### ii) Run script
```
$ node generatePredictions.js
```

If this is successful, you should see something like this in the console for each page:
```
{ pagePath: 'dogs/poodle.html',
  pageviews: 300,
  exits: 200,
  nextPageviews: 100,
  nextExits: 100,
  nextPages:
   [ { pagePath: '/dogs/puppies/', pageviews: 100 } ],
  percentExits: 0.6666666666666666,
  topNextPageProbability: 0.3333333333333333 }
```

You can also explore the results in Mongo:
```
$ mongo
$ use guessjs_dev
$ db.predictions.find()
```

#### iii) (Optional) Setup a cron job
It is recommended that you set up a cron job to periodically re-run generatePredictions.js. This will ensure that the prefetch links are as accurate as possible. The ideal frequency of this cron job depends on how frequently your site changes.

You can also experiment with the date range of data that is used to generate predictions. By default, GuessJS uses the last 30 days of traffic to generate predictions, but this value can be changed (this is located in file: *src/queryParams.js*). It's important to have a sufficiently large data set, so the ideal date range will largely depend on a site's traffic volume. A very high-traffic site might find that using the last 1-7 days of traffic works best, while a low-traffic site find that using the last 30 days works best.
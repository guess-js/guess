#Guess.js

Libraries & tools for enabling data-driven user-experiences on the web.

##Introduction

Guess.js provides libraries & tools to simplify predictive data-analytics driven approaches to improving user-experiences on the web. This data can be driven from any number of sources, including analytics or [machine learning](https://en.wikipedia.org/wiki/Machine_learning&sa=D&ust=1522637949792000) models. Guess.js aims to lower the friction of consuming and applying this thinking to all modern sites and apps, including building libraries & tools for popular workflows.

Applying predictive data-analytics thinking to sites could be applied in a number of contexts:

- **Predict the next page (or pages) a user is likely to visit and prefetch these pages, improving perceived page load performance and user happiness.**
   - Page-level: Prerender/Prefetch the page which is most likely to be visited next
   - Bundle-level: Prefetch the bundles associated with the top *N* pages. On each page navigation, at all the neighbors of the current page, sorted in descending order by the probability to be visited. Fetch assets (JavaScript chunks) for the top N pages, depending on the current connection effective type.
- **Predict the next piece of content (article, product, video) a user is likely to want to view and adjust or filter the user experience to account for this.**
- **Predict the types of widgets an individual user is likely to interact with more (e.g games) and use this data to tailor a more custom experience.**

By collaborating across different touch-points in the ecosystem where data-driven approaches could be easily applied, we hope to generalize common pieces of infrastructure to maximize their applicability in different tech stacks.


##Problems

- Developers using [`<link rel=prefetch>`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ&sa=D&ust=1522637949794000) for future navigations heavily rely on manually reading descriptive analytics to inform their decisions for what to prefetch.
- These decisions are often made at a point in time and.. 
  - (1) are often not revisited as data trends change
  - (2) are very limited in how they are used. Implementations will often only prefetch content from a homepage or very small set of hero pages, but otherwise not do this for all of the possible entry points on a site. This can leave performance opportunities on the table.
  - (3) Require some amount of confidence about the data being used to drive decisions around using prefetching means that developers may not be adopting it out of worry they will waste bandwidth. `<link rel=prefetch>` is [currently used on 5%](https://www.chromestatus.com/metrics/feature/popularity%23LinkRelPrefetch&sa=D&ust=1522637949795000) of total Chrome pageloads, but this could be higher.
- Implementing predictive analytics is too complex for the average web developer.
  - Most developers are unfamiliar with how to leverage the  [Google Analytics API](https://developers.google.com/analytics/devguides/reporting/core/v4/&sa=D&ust=1522637949796000) to determine the probability a page will be visited next. We lack:
  - (1) Page-level solution: a drop-in client-side solution for prefetching pages a user will likely visit
  - (2) Bundling-level solution: a set of plugins/tools that work with today’s JavaScript bundlers (e.g webpack) to cluster and generate the bundles/chunks a particular set of navigation paths could load quicker were they to be prefetched ahead of time.
- Most developers are not yet familiar with how  [Machine Learning](https://en.wikipedia.org/wiki/Machine_learning&sa=D&ust=1522637949797000) works. They are generally:
  - (1) Unsure how (and why) ML could be integrated into their existing (web) tech stacks
  - (2) What the value proposition of  [TensorFlow](https://www.tensorflow.org/&sa=D&ust=1522637949797000) is or where solutions like the [CloudML](https://cloud.google.com/ml-engine/&sa=D&ust=1522637949798000) engine fit in. We have an opportunity to simplify the overhead associated with leveraging some of these solutions.
- Best-in-class / low-friction approaches in this space are still slowly emerging and are not yet as accessible to web developers without ML or data-science backgrounds.
  - [Machine Learning meets Cloud: Intelligent Prefetching](https://iihnordic.com/blog/machine-learning-meets-the-cloud-intelligent-prefetching/&sa=D&ust=1522637949798000) by IIH Nordic
      - Tag Managers like  [Google Tag Manager](https://www.google.com/analytics/tag-manager/&sa=D&ust=1522637949799000) can be used to decouple page content from the code tracking how the content is used. This allows web analysts to upgrade the tracking code in real-time with no site downtime. Tag managers allow a general solution for code injection and can be used to deploy intelligent prefetching. The advantages: analytics used to build the model comes from the tag manager. We can also send data live to the predictor without additional tracker overhead. After adding a few (of Nordic’s) tags to a GTM install, a site can start to prefetch resources of the next pages and track load time saving opportunities.
       - Nordic moved the predictive prefetching model to a web service the browser queries when a user visits a new page. The service responds to each request and takes advantage of Google Cloud, App Engine and  [Cloud ML](https://cloud.google.com/ml-engine/&sa=D&ust=1522637949799000). Their solution uses a  [Markov model](https://en.wikipedia.org/wiki/Markov_model&sa=D&ust=1522637949800000) in  [TensorFlow](https://www.tensorflow.org/&sa=D&ust=1522637949800000) (often a neural net is used).
       - With user behavior changing over time, predictive models require updating (training) from time to time. Training a model involves collecting and transforming data and fitting the parameters of the model accordingly. Nordic use Google Cloud to pull data from a customer’s analytics service into a private data bucket in  [BigQuery](https://cloud.google.com/bigquery/&sa=D&ust=1522637949800000). They process this data, train and test predictive models, updating the prediction service seamlessly.
     - Nordic suggest small/slow sites update their models monthly. Larger sites may need to retrain daily (news).
      - The benefit of training ML models in the cloud is ease of scale as additional machines, GPUs and processors can be added as needed.
    -  [Machine Learning-Driven Bundling. The Future of JavaScript Tooling](http://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/&sa=D&ust=1522637949801000) by Minko


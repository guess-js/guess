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


##Data Analytics

There are  [three primary types](https://halobi.com/blog/descriptive-predictive-and-prescriptive-analytics-explained/&sa=D&ust=1522637949802000) of data analytics worth being aware of in this problem space: descriptive, predictive and prescriptive. Each type is related and help teams leverage different kinds of insight.

###Descriptive - what has happened?

Descriptive analytics summarizes raw data and turns it into something interpretable by humans. It can look at past events, regardless of when the events have occurred. Descriptive analytics allow teams to learn from past behaviors and this can help them influence future outcomes. Descriptive analytics could determine what pages on a site users have previously viewed and what navigation paths they have taken given any given entry page.

###Predictive - what will happen?

Predictive analytics “predicts” what can happen next. Predictive analytics helps us understand the future and gives teams actionable insights using data. It provides estimates of the likelihood of a future outcome being useful. It’s important to keep in mind, few algorithms can predict future events with complete accuracy, but we can use as many signals that are available to us as possible to help improve baseline accuracy. The foundation of predictive analytics is based on probabilities we determine from data. Predictive analytics could predict the next page or set of pages a user is likely to visit given an arbitrary entry page.


###Prescriptive - what should we do?

Prescriptive analytics enables prescribing different possible actions to guide towards a solution. Prescriptive analytics provides advice, attempting to quantify the impact future decisions may have to advise on possible outcomes before these decisions are made. Prescriptive analytics aims to not just predict what is going to happen but goes further; informing why it will happen and providing recommendations about actions that can take advantage of such predictions. Prescriptive analytics could predict the next page a user will visit, but also suggest actions such as informing you of ways you can customize their experience to take advantage of this knowledge.


##Prediction Models

###Markov Models

The key objective of a prediction model in the prefetching problem space is to identify what the subsequent requests a user may need, given a specific page request. This allows a server or client to pre-fetch the next set of pages and attempt to ensure they are in a user’s cache before they directly navigate to the page. The idea is to reduce overall loading time. When this is implemented with care, this technique can reduce page access times and latency, improving the overall user experience.


[Markov models](https://en.wikipedia.org/wiki/Markov_model&sa=D&ust=1522637949805000) have been widely used for researching and understanding stochastic (random probability distribution) process [[Ref](http://citeseerx.ist.psu.edu/viewdoc/download?doi%3D10.1.1.436.2396%26rep%3Drep1%26type%3Dpdf&sa=D&ust=1522637949806000),  [Ref](https://www.researchgate.net/publication/266568034_Effective_Web_Cache_Pre-fetching_technique_using_Markov_Chain&sa=D&ust=1522637949806000)] . They have been demonstrated to be well-suited for modeling and predicting a user’s browsing behavior. The input for these problems tends to be the sequence of web pages accessed by a user or set of users (site-wide) with the goal of building Markov models we can use to model and predict the pages a user will most likely access next. A Markov process has states representing accessed pages and edges representing transition probabilities between states which are computed from a given sequence in an analytics log. A trained Markov model can be used to predict the next state given a set of k previous states.


In some applications, first-order Markov models aren’t as accurate in predicting user browsing behaviors as these do not always look into the past to make a distinction between different patterns that have been observed. This is one reason higher-order models are often used. These higher-order models have limitations with state-space complexity, less broad coverage and sometimes reduced prediction accuracy.


### All-Kth-Order Markov Model

One way [[Ref](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf&sa=D&ust=1522637949807000)] to overcome this problem is to train varying order Markov models, which we then use during the prediction phase. This was attempted in the  [All-Kth-Order Markov model](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf&sa=D&ust=1522637949808000) proposed in this  [Ref](https://dl.acm.org/citation.cfm?id%3D1251493&sa=D&ust=1522637949808000). This can make state-space complexity worse, however. Another approach is to identify frequent access patterns (longest repeating subsequences) and use this set of sequences for predictions. Although this approach can have an order of magnitude reduction on state-space complexity, it can reduce prediction accuracy.


### Selective Markov Models

[Selective Markov models](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf&sa=D&ust=1522637949808000) (SMM) which only store some states within the model have also been proposed as a solution to state-space complexity tradeoffs. They begin with a All-Kth-Order Markov Model - a post-pruning approach is then used to prune states that are not expected to be accurate predictors. The result of this is a model which has the same prediction power of All-Kth-Order models with less space complexity and higher prediction accuracy. In  [Deshpane and Karpis](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf&sa=D&ust=1522637949809000), different criteria to prune states in the model before prediction (frequency, confidence, error) are looked at.


### Semantic-pruned Selective Markov Models


In  [Mabroukeh and Ezeife](http://ieeexplore.ieee.org/document/5360449/?reload%3Dtrue&sa=D&ust=1522637949809000), the performance of semantic-rich 1st and 2nd order Markov models was studied and compared with that of higher-order SMM and semantic-pruned SMM. They discovered that semantic-pruned SMM have a 16% smaller size than frequency-pruned SMM and provide nearly an equal accuracy.


### Clustering

Observing navigation patterns can allow us to analyze user behavior. This approach requires access to user-session identification, clustering sessions into similar clusters and developing a model for prediction using current and earlier access patterns. Much of the previous work in this field has relied on clustering schemes like the  [K-means clustering](https://en.wikipedia.org/wiki/K-means_clustering&sa=D&ust=1522637949810000) technique with  [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance&sa=D&ust=1522637949810000) for improving confidence of predictions. One of the drawbacks to using K-means is difficulty deciding on the number of clusters, selecting the initial random center and the order of page visits is not always considered.  [Kumar et al](http://ieeexplore.ieee.org/document/7519368/&sa=D&ust=1522637949811000) investigated this, proposing a hierarchical clustering technique with a modified  [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance&sa=D&ust=1522637949811000), pagerank using access time length, frequency and higher order Markov models for prediction.

[![Build Status](https://travis-ci.com/guess-js/guess.svg?branch=master)](https://travis-ci.com/guess-js/guess)

# Guess.js (alpha)

Libraries and tools for enabling data-driven user-experiences on the web.

## Quickstart

***For Webpack users:***
### :black_circle: Data-driven bundling

Install and configure [GuessPlugin](https://github.com/guess-js/guess/tree/master/packages/webpack) - the Guess.js webpack plugin which automates as much of the setup process for you as possible. 

Should you wish to try out the modules we offer individually, the `packages` directory contains three packages:

* [`ga`](https://github.com/guess-js/guess/tree/master/packages/ga) - a module for fetching structured data from the Google Analytics API to learn about user navigation patterns. 
* [`parser`](https://github.com/guess-js/guess/tree/master/packages/parser) - a module providing JavaScript framework parsing. This powers the route-parsing capabilities implemented in the Guess webpack plugin.
* [`webpack`](https://github.com/guess-js/guess/tree/master/packages/webpack) - a webpack plugin for setting up predictive fetching in your application. It consumes the `ga` and `parser` modules and offers a large number of options for configuring how predictive fetching should work in your application. 

***For non-Webpack users:***
### :black_circle: Data-driven loading

Our [predictive-fetching for sites](https://github.com/guess-js/guess/tree/master/experiments/guess-static-sites) workflow provides a set of steps you can follow to integrate predictive fetching using the Google Analytics API to your site. 

This repo uses [Google Analytics](http://analytics.google.com) data to determine which page a user is mostly likely to visit next from a given page. A client-side script (which you'll add to your application) sends a request to the server to get the URL of the page it should fetch, then prefetches this resource.

## Learn More
### What is Guess.js?

Guess.js provides libraries & tools to simplify predictive data-analytics driven approaches to improving user-experiences on the web. This data can be driven from any number of sources, including analytics or [machine learning](https://en.wikipedia.org/wiki/Machine_learning?sa=D&ust=1522637949792000) models. Guess.js aims to lower the friction of consuming and applying this thinking to all modern sites and apps, including building libraries & tools for popular workflows.

Applying predictive data-analytics thinking to sites could be applied in a number of contexts:

* **Predict the next page (or pages) a user is likely to visit and prefetch these pages, improving perceived page load performance and user happiness.**
  * Page-level: Prerender/Prefetch the page which is most likely to be visited next
  * Bundle-level: Prefetch the bundles associated with the top _N_ pages. On each page navigation, at all the neighbors of the current page, sorted in descending order by the probability to be visited. Fetch assets (JavaScript chunks) for the top N pages, depending on the current connection effective type.
* **Predict the next piece of content (article, product, video) a user is likely to want to view and adjust or filter the user experience to account for this.**
* **Predict the types of widgets an individual user is likely to interact with more (e.g games) and use this data to tailor a more custom experience.**

By collaborating across different touch-points in the ecosystem where data-driven approaches could be easily applied, we hope to generalize common pieces of infrastructure to maximize their applicability in different tech stacks.


### Problems we're looking to solve



* Developers using [`<link rel=prefetch>`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ?sa=D&ust=1522637949794000) for future navigations heavily rely on manually reading descriptive analytics to inform their decisions for what to prefetch.
* These decisions are often made at a point in time and..
  * (1) are often not revisited as data trends change
  * (2) are very limited in how they are used. Implementations will often only prefetch content from a homepage or very small set of hero pages, but otherwise not do this for all of the possible entry points on a site. This can leave performance opportunities on the table.
  * (3) Require some amount of confidence about the data being used to drive decisions around using prefetching means that developers may not be adopting it out of worry they will waste bandwidth. `<link rel=prefetch>` is [currently used on 5%](https://www.chromestatus.com/metrics/feature/popularity%23LinkRelPrefetch?sa=D&ust=1522637949795000) of total Chrome pageloads, but this could be higher.
* Implementing predictive analytics is too complex for the average web developer.
  * Most developers are unfamiliar with how to leverage the [Google Analytics API](https://developers.google.com/analytics/devguides/reporting/core/v4/?sa=D&ust=1522637949796000) to determine the probability a page will be visited next. We lack:
  * (1) Page-level solution: a drop-in client-side solution for prefetching pages a user will likely visit
  * (2) Bundling-level solution: a set of plugins/tools that work with today’s JavaScript bundlers (e.g webpack) to cluster and generate the bundles/chunks a particular set of navigation paths could load quicker were they to be prefetched ahead of time.
* Most developers are not yet familiar with how [Machine Learning](https://en.wikipedia.org/wiki/Machine_learning?sa=D&ust=1522637949797000) works. They are generally:
  * (1) Unsure how (and why) ML could be integrated into their existing (web) tech stacks
  * (2) What the value proposition of [TensorFlow](https://www.tensorflow.org/?sa=D&ust=1522637949797000) is or where solutions like the [CloudML](https://cloud.google.com/ml-engine/?sa=D&ust=1522637949798000) engine fit in. We have an opportunity to simplify the overhead associated with leveraging some of these solutions.
* Best-in-class / low-friction approaches in this space are still slowly emerging and are not yet as accessible to web developers without ML or data-science backgrounds.
  * [Machine Learning meets Cloud: Intelligent Prefetching](https://iihnordic.com/blog/machine-learning-meets-the-cloud-intelligent-prefetching/?sa=D&ust=1522637949798000) by IIH Nordic
    * Tag Managers like [Google Tag Manager](https://www.google.com/analytics/tag-manager/?sa=D&ust=1522637949799000) can be used to decouple page content from the code tracking how the content is used. This allows web analysts to upgrade the tracking code in real-time with no site downtime. Tag managers allow a general solution for code injection and can be used to deploy intelligent prefetching. The advantages: analytics used to build the model comes from the tag manager. We can also send data live to the predictor without additional tracker overhead. After adding a few (of IIH Nordic’s) tags to a GTM install, a site can start to prefetch resources of the next pages and track load time saving opportunities.
    * IIH Nordic moved the predictive prefetching model to a web service the browser queries when a user visits a new page. The service responds to each request and takes advantage of Google Cloud, App Engine and [Cloud ML](https://cloud.google.com/ml-engine/?sa=D&ust=1522637949799000). Their solution chooses the most accurate model, choices include a [Markov model](https://en.wikipedia.org/wiki/Markov_model?sa=D&ust=1522637949800000) or most often a deep neural net in [TensorFlow](https://www.tensorflow.org/?sa=D&ust=1522637949800000).
    * With user behavior changing over time, predictive models require updating (training) from time to time. Training a model involves collecting and transforming data and fitting the parameters of the model accordingly. IIH Nordic use Google Cloud to pull data from a customer’s analytics service into a private data bucket in [BigQuery](https://cloud.google.com/bigquery/?sa=D&ust=1522637949800000). They process this data, train and test predictive models, updating the prediction service seamlessly.
    * IIH Nordic suggest small/slow sites update their models monthly. Larger sites may need to retrain daily or even hourly for news websites.
    * The benefit of training ML models in the cloud is ease of scale as additional machines, GPUs and processors can be added as needed.
    * [Machine Learning-Driven Bundling. The Future of JavaScript Tooling](http://blog.mgechev.com/2018/03/18/machine-learning-data-driven-bundling-webpack-javascript-markov-chain-angular-react/?sa=D&ust=1522637949801000) by Minko

#### Initial priority: Improved Performance through Data-driven Prefetching

The first large priority for Guess.js will be improving web performance through predictive prefetching of content.

By building a model of pages a user is likely to visit, given an arbitrary entry-page, a solution could calculate the likelihood a user will visit a given next page or set of pages and prefetch resources for them while the user is still viewing their current page. This has the possibility of improving page-load performance for subsequent page visits as there's a strong chance a page will already be in the user's cache.

### Possible approaches to predictive fetching

In order to predict the next page a user is likely to visit, solutions could use the [Google Analytics API](https://developers.google.com/analytics/devguides/reporting/core/v4/?sa=D&ust=1522637949828000). Google Analytics session data can be used to create a model to predict the most likely page a user is going to visit next on a site. The benefit of this session data is that it can evolve over time, so that if particular navigation paths change, the predictions can stay up to date too.

With the availability of this data, an engine could insert `<link rel="[prerender/prefetch/preload]">` tags to speed up the load time for the next page request. In some tests, such as Mark Edmondson's [Supercharging Page-Loads with R](http://code.markedmondson.me/predictClickOpenCPU/supercharge.html?sa=D&ust=1522637949828000), this led to a 30% improvement in page load times. The approach Mark used in his research involved using GTM tags and machine-learning to train a model for page predictions. This is an idea Mark continued in [Machine Learning meets the Cloud - Intelligent Prefetching](https://iihnordic.com/blog/machine-learning-meets-the-cloud-intelligent-prefetching/?sa=D&ust=1522637949828000).

While this approach is sound, the methodology used could be deemed a little complex. Another approach that could be taken (which is simpler) is attempting to get accurate prediction data from the Google Analytics API. If you ran a report for the [Page](https://developers.google.com/analytics/devguides/reporting/core/dimsmets%23view%3Ddetail%26group%3Dpage_tracking%26jump%3Dga_pagepath?sa=D&ust=1522637949829000) and [Previous Page Path](https://developers.google.com/analytics/devguides/reporting/core/dimsmets%23view%3Ddetail%26group%3Dpage_tracking%26jump%3Dga_previouspagepath?sa=D&ust=1522637949829000) dimension combined with the [Pageviews](https://developers.google.com/analytics/devguides/reporting/core/dimsmets%23view%3Ddetail%26group%3Dpage_tracking%26jump%3Dga_pageviews?sa=D&ust=1522637949830000) and [Exits](https://developers.google.com/analytics/devguides/reporting/core/dimsmets%23view%3Ddetail%26group%3Dpage_tracking%26jump%3Dga_exits?sa=D&ust=1522637949830000) metrics this should provide enough data to wire up prefetches for most popular pages.

#### Machine Learning for predictive fetching

ML could help improve the overall accuracy of a solution's predictions, but is not a necessity for an initial implementation. Predictive fetching could be accomplished by training a model on the pages users are likely to visit and improving on this model over time.

Deep neural networks are particularly good at teasing out the complexities that may lead to a user choosing one page over another, in particular, if we wanted to attempt a version of the solution that was catered to the pages an individual user might visit vs. the pages a "general/median" user might visit next. Fixed page sequences (prev, current, next) might be the easiest to begin dealing with initially. This means building a model that is unique to your set of documents.

Model updates tend to be done periodically, so one might setup a nightly/weekly job to refresh based on new user behaviour. This could be done in real-time, but is likely complex, so doing it periodically might be sufficient. One could imagine a generic model representing behavioural patterns for users on a site that can either be driven by a trained status set, Google Analytics, or a custom description you plugin using a new layer into a router giving the site the ability to predictively fetch future pages, improving page load performance.

### Possible approaches to speculative prefetch

#### Speculative prefetch on page load

Speculative prefetch can prefetch pages likely be navigated to on page load. This assumes the existence of knowledge about the probability a page will need a certain next page or set of pages, or a training model that can provide a data-driven approach to determining such probabilities.

Prefetching on page load can be accomplished in a number of ways, from deferring to the UA to decide when to prefetch resources (e.g at low priority with `<link rel=prefetch>`), during page idle time (via [requestIdleCallback()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback?sa=D&ust=1522637949834000)()) or at some other interval. No further interaction is required by the user.

#### Speculative prefetch when links come into the viewport

A page could speculatively begin prefetching content when links in the page are visible in the viewport, signifying that the user may have a higher chance of wanting to click on them.

This is an approach used by [Gatsby](https://www.gatsbyjs.org/?sa=D&ust=1522637949834000) (which uses [React](https://reactjs.org/?sa=D&ust=1522637949835000) and [React Router](https://github.com/ReactTraining/react-router?sa=D&ust=1522637949835000)). Their specific implementation is as follows:

* In browsers that support [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API?sa=D&ust=1522637949836000), whenever a `<Link>` component becomes invisible, the link "votes" for the page linked to to be prefetched votes are worth slightly less points each time so links at the top of the page are prioritized over ones lower down
* e.g. the top nav if a page is linked to multiple times, its vote count goes higher the prefetcher takes the top page and starts prefetching resources.
* It's restricted to prefetching one page at a time so as to reduce contention over bandwidth with on page stuff (not a problem on fast networks. If a user visits a page and its resources haven't been fully downloaded, prefetching stops until the page is loaded to ensure the user waits as little time as possible.

#### Speculative prefetch on user interaction

A page could begin speculatively prefetching resources when a user indicates they are interested in some content. This can take many forms, including when a user chooses to hover over a link or some portion of UI that would navigate them to a separate page. The browser could begin fetching content for the link as soon as there was a clear indication of interest. This is an approach taken by JavaScript libraries such as [InstantClick](http://instantclick.io/?sa=D&ust=1522637949837000).

### Risks

#### Data consumption

As with any mechanism for prefetching content ahead of time, this needs to be approached very carefully. A user on a restricted data-plan may not appreciate or benefit as much from pages being fetched ahead of time, in particular if they start to eat up their data. There are mechanisms a site/solution could take to be mindful of this concern, such as respecting the [Save-Data](https://developers.google.com/web/updates/2016/02/save-data?sa=D&ust=1522637949832000) header.

#### Prefetching undesirable pages

Prefetching links to "logout" pages is likely undesirable. The same could be said of any pages that trigger an action on page-load (e.g one-click purchase). Solutions may wish to include a blacklist of URLs which are never prefetched to increase the likelihood of a prefetched page being useful.

#### Web Standards

##### Future of rel=prerender

Some of the attempts to accomplish similar proposals in the past have relied on `<link rel=prerender>`. The Chrome team is currently exploring [deprecating rel=prerender](https://groups.google.com/a/chromium.org/forum/%23!topic/blink-dev/0nSxuuv9bBw?sa=D&ust=1522637949833000) in favor of [NoStatePrefetch](https://docs.google.com/document/d/16VCYGGWau483IMSxODpg5faZny1FJ6vNK2v-BuM5EhU/edit%23?sa=D&ust=1522637949833000) - a lighter version of this mechanism that only prefetches to the HTTP cache but uses no other state of the web platform. A solution should factor in whether it will be relying on the replacement to rel=prerender or using prefetch/preload/other approaches.

There are two key differences between NoStatePrefetch and Prefetch 1. nostate-prefetch is a mechanism, and `<link rel=prefetch>` is an API. The nostate-prefetch can be requested by other entry points: omnibox prediction, custom tabs, `<link rel=prerender>`.

2.  The implementation is different: `<link rel=prefetch>` prefetches one resource, but nostate-prefetch on top of that runs the preload scanner on the resource (in a fresh new renderer), discovers subresources and prefetches them as well (without recursing into preload scanner).



### Relevant Data Analytics

There are [three primary types](https://halobi.com/blog/descriptive-predictive-and-prescriptive-analytics-explained/?sa=D&ust=1522637949802000) of data analytics worth being aware of in this problem space: descriptive, predictive and prescriptive. Each type is related and help teams leverage different kinds of insight.

#### Descriptive - what has happened?

Descriptive analytics summarizes raw data and turns it into something interpretable by humans. It can look at past events, regardless of when the events have occurred. Descriptive analytics allow teams to learn from past behaviors and this can help them influence future outcomes. Descriptive analytics could determine what pages on a site users have previously viewed and what navigation paths they have taken given any given entry page.

#### Predictive - what will happen?

Predictive analytics “predicts” what can happen next. Predictive analytics helps us understand the future and gives teams actionable insights using data. It provides estimates of the likelihood of a future outcome being useful. It’s important to keep in mind, few algorithms can predict future events with complete accuracy, but we can use as many signals that are available to us as possible to help improve baseline accuracy. The foundation of predictive analytics is based on probabilities we determine from data. Predictive analytics could predict the next page or set of pages a user is likely to visit given an arbitrary entry page.

#### Prescriptive - what should we do?

Prescriptive analytics enables prescribing different possible actions to guide towards a solution. Prescriptive analytics provides advice, attempting to quantify the impact future decisions may have to advise on possible outcomes before these decisions are made. Prescriptive analytics aims to not just predict what is going to happen but goes further; informing why it will happen and providing recommendations about actions that can take advantage of such predictions. Prescriptive analytics could predict the next page a user will visit, but also suggest actions such as informing you of ways you can customize their experience to take advantage of this knowledge.

### Relevant Prediction Models

#### Markov Models

The key objective of a prediction model in the prefetching problem space is to identify what the subsequent requests a user may need, given a specific page request. This allows a server or client to pre-fetch the next set of pages and attempt to ensure they are in a user’s cache before they directly navigate to the page. The idea is to reduce overall loading time. When this is implemented with care, this technique can reduce page access times and latency, improving the overall user experience.

[Markov models](https://en.wikipedia.org/wiki/Markov_model?sa=D&ust=1522637949805000) have been widely used for researching and understanding stochastic (random probability distribution) process [[Ref](http://citeseerx.ist.psu.edu/viewdoc/download?doi%3D10.1.1.436.2396%26rep%3Drep1%26type%3Dpdf?sa=D&ust=1522637949806000), [Ref](https://www.researchgate.net/publication/266568034_Effective_Web_Cache_Pre-fetching_technique_using_Markov_Chain?sa=D&ust=1522637949806000)] . They have been demonstrated to be well-suited for modeling and predicting a user’s browsing behavior. The input for these problems tends to be the sequence of web pages accessed by a user or set of users (site-wide) with the goal of building Markov models we can use to model and predict the pages a user will most likely access next. A Markov process has states representing accessed pages and edges representing transition probabilities between states which are computed from a given sequence in an analytics log. A trained Markov model can be used to predict the next state given a set of k previous states.

In some applications, first-order Markov models aren’t as accurate in predicting user browsing behaviors as these do not always look into the past to make a distinction between different patterns that have been observed. This is one reason higher-order models are often used. These higher-order models have limitations with state-space complexity, less broad coverage and sometimes reduced prediction accuracy.

#### All-Kth-Order Markov Model

One way [[Ref](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf?sa=D&ust=1522637949807000)] to overcome this problem is to train varying order Markov models, which we then use during the prediction phase. This was attempted in the [All-Kth-Order Markov model](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf?sa=D&ust=1522637949808000) proposed in this [Ref](https://dl.acm.org/citation.cfm?id%3D1251493?sa=D&ust=1522637949808000). This can make state-space complexity worse, however. Another approach is to identify frequent access patterns (longest repeating subsequences) and use this set of sequences for predictions. Although this approach can have an order of magnitude reduction on state-space complexity, it can reduce prediction accuracy.

#### Selective Markov Models

[Selective Markov models](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf?sa=D&ust=1522637949808000) (SMM) which only store some states within the model have also been proposed as a solution to state-space complexity tradeoffs. They begin with a All-Kth-Order Markov Model - a post-pruning approach is then used to prune states that are not expected to be accurate predictors. The result of this is a model which has the same prediction power of All-Kth-Order models with less space complexity and higher prediction accuracy. In [Deshpane and Karpis](http://www.siam.org/meetings/sdm01/pdf/sdm01_04.pdf?sa=D&ust=1522637949809000), different criteria to prune states in the model before prediction (frequency, confidence, error) are looked at.

#### Semantic-pruned Selective Markov Models

In [Mabroukeh and Ezeife](http://ieeexplore.ieee.org/document/5360449/?reload%3Dtrue?sa=D&ust=1522637949809000), the performance of semantic-rich 1st and 2nd order Markov models was studied and compared with that of higher-order SMM and semantic-pruned SMM. They discovered that semantic-pruned SMM have a 16% smaller size than frequency-pruned SMM and provide nearly an equal accuracy.

#### Clustering

Observing navigation patterns can allow us to analyze user behavior. This approach requires access to user-session identification, clustering sessions into similar clusters and developing a model for prediction using current and earlier access patterns. Much of the previous work in this field has relied on clustering schemes like the [K-means clustering](https://en.wikipedia.org/wiki/K-means_clustering?sa=D&ust=1522637949810000) technique with [Euclidean distance](https://en.wikipedia.org/wiki/Euclidean_distance?sa=D&ust=1522637949810000) for improving confidence of predictions. One of the drawbacks to using K-means is difficulty deciding on the number of clusters, selecting the initial random center and the order of page visits is not always considered. [Kumar et al](http://ieeexplore.ieee.org/document/7519368/?sa=D&ust=1522637949811000) investigated this, proposing a hierarchical clustering technique with a modified [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance?sa=D&ust=1522637949811000), pagerank using access time length, frequency and higher order Markov models for prediction.

### Research review

Many of the papers referenced in the following section are centered around the Markov model, association rules and clustering. Papers highlighting relevant work related to pattern discovery for evolving page prediction accuracy are our focus.

#### Sarukkai [2000] “[Link prediction and path analysis using Markov chains](https://www.sciencedirect.com/science/article/pii/S138912860000044X?sa=D&ust=1522637949813000)”.

Uses first-order Markov models to model the sequence of web-pages requested by a user for predicting the next page they are likely to access. Markov chains allow the system to dynamically model URL access patterns observed in navigation logs based on previous state. A “personalized” Markov model is trained for each user and used to predict a user’s future sessions. In practice, it’s overly expensive to construct a unique model for each user and the cost of scaling this becomes more challenging when a site has a large user-base.

#### Chun-Jung Lin [2005] ”[Using Hidden Markov Model to Predict the Surfing User’s Intention of Cyber Purchase on the Web](https://www.researchgate.net/publication/260319657_Using_Hidden_Markov_Model_to_Predict_the_Surfing_User's_Intention_of_Cyber_Purchase_on_the_Web?sa=D&ust=1522637949814000)”

First paper to investigate Hidden Markov Models (HMM). Author collected web server logs, pruned the data and patched the paths users passed by. Based on HMM, author constructed a specific model for web browsing that predicts whether the users have the intention to purchase in real-time. Related measures, like speeding up the operation and their impact when in a purchasing mode are investigated.

#### Elli Voudigari [2010-2011] ” [A Framework for Web Page Rank Prediction](https://link.springer.com/chapter/10.1007/978-3-642-23960-1_29?sa=D&ust=1522637949814000)”.

Proposes a framework to predict ranking positions of a page based on their previous rankings. Assuming a set of successive Top-K rankings, the author identifies predictors based on different methodologies. Prediction quality is quantified as the similarity between predicted and actual rankings. Exhaustive experiments were performed on a real-world large scale dataset for both global and query-based top-K rankings. A variety of existing similarity measures for comparing Top-K ranked lists including a novel one captured in the paper.

#### Mogul [1996] “ [Using predictive prefetching to improve World Wide Web latency](https://www.semanticscholar.org/paper/Using-predictive-prefetching-to-improve-World-Wide-Padmanabhan-Mogul/4d7e5e430bec3db4044b13ce8da7411f09c745f3?sa=D&ust=1522637949815000)”.

Proposes using N-hop Markov models to predict the next web page users are likely to access. Pattern matches the user’s current access sequence with the user’s historical web access sequences to improve the prediction accuracy for prefetches.

#### Borges, Levene [2007] “[Evaluating Variable-Length Markov Chain Models for Analysis of User Web Navigation Sessions](http://ieeexplore.ieee.org/document/4118703/?sa=D&ust=1522637949816000)”.

Proposes dynamic clustering-based methods to increase Markov model accuracy in representing a collection of web navigation sessions. Uses a state cloning concept to duplicate states in a way separating in-links whose corresponding second-order probabilities diverge. The method proposed includes a clustering technique determining a way to assign in-links with similar second-order probabilities to the same clone.

#### Banu Deniz Gunel [2010] ” [Investigating the Effect of Duration, Page Size and Frequency on Next Page Recommendation with Page Rank Algorithm](https://www.researchgate.net/publication/268366760_Investigating_the_Effect_of_Duration_Page_Size_and_Frequency_on_Next_Page_Recommendation_with_Page_Rank_Algorithm?sa=D&ust=1522637949817000)”.

Extends the use of a page-rank algorithm with numerous navigational attributes: size of the page, duration time of the page, duration of transition (two page visits sequentially), frequency of page and transition. Defines a Duration Based Rank (DPR) and Popularity Based Page Rank (PPR). Author looked at the popularity of transitions and pages using duration information, using it with page size and visit frequency. Using the popularity value of pages, this paper attempts to improve conventional page rank algorithms and model a next page prediction under a given Top-N value.

## References

* [Supercharging page-loads with R](http://code.markedmondson.me/predictClickOpenCPU/supercharge.html?sa=D&ust=1522637949840000)
* [Using Google Analytics to predict clicks](https://www.noisetosignal.io/2016/11/using-google-analytics-to-predict-clicks-and-speed-up-your-website/?sa=D&ust=1522637949841000)
* [Gatsby's Link](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-link?sa=D&ust=1522637949841000)
* [Eve Dynamic Prerender](https://wordpress.org/plugins/eve-dynamic-prerender/?sa=D&ust=1522637949841000)
* [InstartLogic - Multi-page Predictive Prefetching](https://www.instartlogic.com/blog/predicting-future-multi-page-predictive-prefetching?sa=D&ust=1522637949841000)
* [Sirko Engine](https://github.com/sirko-io/engine?sa=D&ust=1522637949842000) - relies on Service Worker

<h2>Team</h2>

<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="100" height="100" src="https://github.com/mgechev.png?s=150">
        <br>
        <a href="https://github.com/mgechev">Minko Gechev</a>
      </td>
      <td align="center" valign="top">
        <img width="100" height="100" src="https://github.com/addyosmani.png?s=150">
        <br>
        <a href="https://github.com/addyosmani">Addy Osmani</a>
      </td>
      <td align="center" width="20%" valign="top">
        <img width="100" height="100" src="https://github.com/khempenius.png?s=150">
        <br>
        <a href="https://github.com/khempenius">Katie Hempenius</a>
      </td>
      <td align="center" valign="top">
        <img width="100" height="100" src="https://github.com/kyleamathews.png?s=150">
        <br>
        <a href="https://github.com/kyleamathews">Kyle Mathews</a>
      </td>
     </tr>
  </tbody>
</table>

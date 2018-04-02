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


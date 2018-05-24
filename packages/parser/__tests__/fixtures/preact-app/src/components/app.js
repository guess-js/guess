import { h, Component } from 'preact';
import { Router } from 'preact-router';
import AsyncRoute from 'preact-async-route';

import Info from './info';
import Header from './header';
import Home from '../routes/home';
import About from '../routes/about';
// import Home from 'async!../routes/home';
// import Profile from 'async!../routes/profile';

if (module.hot) {
  require('preact/debug');
}

export default class App extends Component {
  /** Gets fired when the route changes.
   *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
   *	@param {string} event.url	The newly routed URL
   */
  handleRoute = e => {
    this.currentUrl = e.url;
  };

  render() {
    return (
      <div id="app">
        <Header />
        <Router onChange={this.handleRoute}>
          <Home path="/" />
          <Home path="/home" />
          <About path="/about" />
          <Info path="/info" />
          <AsyncRoute path="/profile/" getComponent={() => import('../routes/profile').then(m => m.default)} />
          <AsyncRoute path="/profile/:user" getComponent={() => import('../routes/profile').then(m => m.default)} />
        </Router>
      </div>
    );
  }
}

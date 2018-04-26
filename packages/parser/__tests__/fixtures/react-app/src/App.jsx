import createBrowserHistory from 'history/createBrowserHistory';
import * as React from 'react';
import { Redirect, Route, Router, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import './App.css';
import { AsyncComponent } from './LazyRoute';

const history = createBrowserHistory();

class App extends React.Component {
  render() {
    return (
      <Router history={history}>
        <div className="App">
          <Link to="/intro">Intro</Link>
          <Link to="/main">Main</Link>
          <div>
            <Switch>
              <Redirect exact={true} from="/" to="/intro" />
              <Route path="/intro" component={AsyncComponent(() => import('./intro/Intro'))} />
              <Route path="/main" component={AsyncComponent(() => import('./main/Main'))} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;

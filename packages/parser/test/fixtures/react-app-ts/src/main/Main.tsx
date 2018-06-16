import * as React from 'react';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { AsyncComponent } from '../LazyRoute';
import Kid from './kid/Kid';

export default class Main extends React.Component {
  public render() {
    return (
      <>
        <>
          <Link to="/main/kid">Kid</Link>
          <Link to="/main/parent">Parent</Link>
        </>
        <p>Main</p>
        <Switch>
          <Route path="/main/kid" component={Kid} />
          <Route path="/main/parent" component={AsyncComponent(() => import('./parent/Parent'))} />
        </Switch>
      </>
    );
  }
}

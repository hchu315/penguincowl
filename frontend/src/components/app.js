import React from 'react';
import { AuthRoute, ProtectedRoute } from '../utils/route_util';
import { Switch } from 'react-router-dom';
import MainPage from './main';
import LoginContainer from './session/login_container';
import SignupContainer from './session/signup_container';

const App = () => (
  <Switch>
    <AuthRoute exact path="/" component={MainPage} />
  </Switch>
);

export default App;
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import About from './About';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Reservations from './reservations/Reservations';
import AddReservation from './reservations/AddReservation';
import ReservationDetails from './reservations/ReservationDetails';
import Server from './utils/Server';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (Server.isLoggedIn() === true ?
      <Component {...props} /> :
      <Redirect
        to={{
          pathname: '/login',
          state: {
            from: props.location,
          },
        }} />)} />
);

export default function App() {
  return (
    <Router>
      {/* A <Switch> looks through its children <Route>s and
              renders the first one that matches the current URL. */}
      <Switch>
        <Route exact path='/login' component={Login} />
        <Route exact path='/' component={Home} />
        <Route exact path='/about' component={About} />
        <PrivateRoute exact path='/logout'
          component={Logout} />
        <PrivateRoute exact path='/reservations'
          component={Reservations} />
        <PrivateRoute exact path='/reservations/add'
          component={AddReservation} />
        <PrivateRoute exact path='/reservations/:id'
          component={ReservationDetails} />
      </Switch>
    </Router>
  );
}

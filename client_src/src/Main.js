import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import About from './About';
import Home from './Home';
import Login from './Login';
import Logout from './Logout';
import Reservations from './Reservations';
import ReservationDetails from './ReservationDetails';
import AddReservation from './AddReservation';
import Server from '../utils/Server';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (Server.isLoggedIn() === true
    ? <Component {...props}/>
    : <Redirect
      to={{
      pathname: '/login',
      state: {
        from: props.location
      }
    }}/>)}/>

)

const Main = () => (

  <main>
    <Switch>
      <Route exact path='/login' component={Login}/>
      <Route exact path='/' component={Home}/>
      <PrivateRoute exact path='/about' component={About}/>
      <PrivateRoute exact path='/logout' component={Logout}/>
      <PrivateRoute exact path='/reservations' component={Reservations}/>
      <PrivateRoute exact path='/reservations/add' component={AddReservation}/>
      <PrivateRoute exact path='/reservations/:id' component={ReservationDetails}/>
    </Switch>
  </main>
)

export default Main;
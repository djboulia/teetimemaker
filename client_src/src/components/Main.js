import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import About from './About';
import Home from './Home';
import Login from './Login';
import Reservations from './Reservations';
import ReservationDetails from './ReservationDetails';
import AddReservation from './AddReservation';
import EditReservation from './EditReservation';
import fakeAuth from './fakeAuth';

const PrivateRoute = ({
  component: Component,
  ...rest
}) => (

  <Route
    {...rest}
    render={(props) => (fakeAuth.isAuthenticated === true
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
      <PrivateRoute exact path='/reservations' component={Reservations}/>
      <PrivateRoute exact path='/reservations/add' component={AddReservation}/>
      <PrivateRoute exact path='/reservations/edit/:id' component={EditReservation}/>
      <PrivateRoute exact path='/reservations/:id' component={ReservationDetails}/>
    </Switch>
  </main>
)

export default Main;
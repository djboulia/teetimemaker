import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import fakeAuth from './fakeAuth';

class Home extends Component {
  render() {
    const {from} = {
      from: {
        pathname: '/reservations'
      }
    }

    if (fakeAuth.isAuthenticated === true) {
      console.log("redirecting...");
      return <Redirect to={from}/>
    }

    return (
      <div>
        <h1>Tee Time Maker</h1>

        <p>
          This app will allow you to make reservations for future tee times. When the tee
          sheet opens, the reservation will be booked on your behalf.
        </p>

        <p>Please <a href="/login">Log in</a> to continue</p>

      </div>
    )
  }
}
export default Home;

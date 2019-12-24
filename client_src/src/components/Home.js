import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import Server from '../utils/Server';

class Home extends Component {
  render() {
    const {from} = {
      from: {
        pathname: '/reservations'
      }
    }

    if (Server.isLoggedIn() === true) {
      console.log("redirecting... to " + from.pathname);
      return <Redirect to={from}/>
    } else {
      console.log("Not logged in");
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

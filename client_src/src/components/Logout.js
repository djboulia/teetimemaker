import React, {Component} from 'react';
import {Redirect} from 'react-router-dom'
import Server from './Server';

class Logout extends Component {

  constructor() {
    super();

    if (Server.isLoggedIn()) {
      Server
        .logout()
        .then(() => {
          console.log("Logged out.");
        })
        .catch((e) => {
          console.log("Error logging out: " + e);
        })
    }
  }

  render() {
    // the constructor attempts the logout, so we just redirect back
    // to the main login page in the render function
    const loginPage = "/login";

    console.log("Redirecting to : " + loginPage);
    return <Redirect to={loginPage}/>
  }
}

export default Logout;

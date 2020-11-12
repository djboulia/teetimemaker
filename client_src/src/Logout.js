import React from 'react';
import { Redirect } from 'react-router-dom'
import Server from './utils/Server';

export default function Logout(props) {

  // the constructor attempts the logout, so we just redirect back
  // to the main login page in the render function
  const loginPage = "/login";

  /**
   * fire change event once
   */
  React.useEffect(() => {
    console.log("Logout.useEffect: ");

    if (Server.isLoggedIn()) {
      Server.logout()
        .then(() => {
          console.log("Logged out.");
        })
        .catch((e) => {
          console.log("Error logging out: " + e);
        })
    }
  }, [])

  console.log("Redirecting to : " + loginPage);
  return <Redirect to={loginPage} />
}

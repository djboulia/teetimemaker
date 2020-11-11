import React, { Component } from 'react';
import { Button, TextField } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import { Redirect } from 'react-router-dom'
import Dashboard from './Dashboard';
import Title from './Title';
import Server from './utils/Server';

let statusMsg = (msg) => {
  const result = <p className="msg">{msg}</p>
  return result;
}

let errorMsg = (msg) => {
  const result = <p className="msg error">{msg}</p>
  return result;
}

class Login extends Component {

  constructor() {
    super();

    this.state = {
      redirectToReferrer: false,
      msg: statusMsg("Please log in.")
    }

    this.handleUserNameChange = this
      .handleUserNameChange
      .bind(this);

    this.handlePasswordChange = this
      .handlePasswordChange
      .bind(this);

    this.handleEnterKey = this
      .handleEnterKey
      .bind(this);

  }

  login() {
    Server
      .login(this.state.username, this.state.password)
      .then((result) => {
        console.log("login result " + result.status);

        this.setState({
          redirectToReferrer: result.status,
          msg: (result.status)
            ? statusMsg(result.msg)
            : errorMsg(result.msg)
        });
      })
  }

  handleUserNameChange(e) {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  /**
   * as a convenience, we start the login process
   * if someone presses enter from the password field.
   * 
   * @param {Object} e key event
   */
  handleEnterKey(e) {
    if (e.key === "Enter") {
      this.login();
    }
  }

  render() {
    const { from } = this.props.location.state || {
      from: {
        pathname: '/'
      }
    }
    const redirectToReferrer = this.state.redirectToReferrer;

    if (redirectToReferrer === true) {
      console.log("Redirecting to : " + from.pathname);
      return <Redirect to={from} />
    }

    const loginMsg = this.state.msg;

    const self = this;

    return (
      <Dashboard>
        <Container maxWidth="xs">
          <Title>Login</Title>

          {loginMsg}

          <TextField
            placeholder="PWCC User Name"
            margin="normal"
            fullWidth
            label="User Name"
            onChange={self.handleUserNameChange} />

          <TextField
            type="password"
            label="password"
            margin="normal"
            fullWidth
            onChange={self.handlePasswordChange}
            onKeyPress={self.handleEnterKey} />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => {
              self.login();
            }}>Log In</Button>

        </Container>

      </Dashboard>
    )
  }
}

export default Login;

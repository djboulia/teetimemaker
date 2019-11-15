import React, {Component} from 'react';
import {Row, Button, TextInput} from 'react-materialize';
import {Redirect} from 'react-router-dom'
import Server from './Server';
import '../App.css';

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
    this.setState({username: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
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
    const {from} = this.props.location.state || {
      from: {
        pathname: '/'
      }
    }
    const redirectToReferrer = this.state.redirectToReferrer;

    if (redirectToReferrer === true) {
      console.log("Redirecting to : " + from.pathname);
      return <Redirect to={from}/>
    }

    const loginMsg = this.state.msg;

    const self = this;

    return (
      <div>
        <h1>Login</h1>

        {loginMsg}

        <Row>
          <TextInput
            placeholder="PWCC User Name"
            m={6}
            label="User Name"
            onChange={self.handleUserNameChange}/>
        </Row>

        <Row>
          <TextInput
            type="password"
            label="password"
            m={6}
            onChange={self.handlePasswordChange}
            onKeyPress={self.handleEnterKey}/>
        </Row>

        <Button onClick={() => {
          self.login();
        }}>Log In</Button>
      </div>
    )
  }
}

export default Login;

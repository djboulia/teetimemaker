import React, {Component} from 'react';
import {Row, Button, Input} from 'react-materialize';
import {Redirect} from 'react-router-dom'
import fakeAuth from './fakeAuth';

class Login extends Component {
  state = {
    redirectToReferrer: false
  }
  login = () => {
    fakeAuth.authenticate(() => {
      this.setState(() => ({redirectToReferrer: true}))
    })
  }
  render() {
    const {from} = this.props.location.state || {
      from: {
        pathname: '/'
      }
    }
    const {redirectToReferrer} = this.state

    if (redirectToReferrer === true) {
      return <Redirect to={from}/>
    }

    const loginMsg = (fakeAuth.isAuthenticated)
      ? <p>You are currently logged in.</p>
      : <p>Please log in.</p>

    const self = this;

    return (
      <div>
        <h1>Login</h1>

        {loginMsg}

        <Row>
          <Input placeholder="PWCC User Name" m={6} label="User Name"/>
        </Row>
        <Row>
          <Input type="password" label="password" m={6}/>
        </Row>

        <Button
        onClick={() => {
          self.login();
      }}>Log In</Button>
      </div>
    )
  }
}

export default Login;

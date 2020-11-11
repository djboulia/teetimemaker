import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Icon from '@material-ui/core/Icon';
import Dashboard from '../Dashboard';
import Title from '../Title';
import Server from '../utils/Server';
import theme from '../theme.js';
import ReservationItems from './ReservationItems';

class Reservations extends Component {

  render() {
    const owner = Server
      .getUser()
      .name;

    return (
      <Dashboard>
        <Container maxWidth="lg">
          <div>
            <Title>Reservations for {owner}</Title>

            <h2>Pending requests</h2>

            <ReservationItems owner={owner}></ReservationItems>

            <div style={{
              margin: theme.spacing(1), // You might not need this now
              position: "fixed",
              bottom: theme.spacing(2),
              right: theme.spacing(3)
            }}>
              <Link to="/reservations/add" className="btn-floating btn-large red">
                <Icon style={{ color: "#FF3333", fontSize: 60 }}>add_circle</Icon>
              </Link>
            </div>
          </div>
        </Container>
      </Dashboard>
    )
  }
}

export default Reservations;
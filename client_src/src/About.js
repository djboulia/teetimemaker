import React, { Component } from 'react';
import Container from '@material-ui/core/Container';
import Dashboard from './Dashboard';
import Title from './Title';

export default function About(props) {
  return (
    <Dashboard>
      <Container maxWidth="sm">
        <Title>About</Title>

        <p>
          This app will allow you to make reservations for
          future tee times. When the tee
          sheet opens, the reservation will be booked on your behalf.
          </p>

      </Container>
    </Dashboard>
  );
}

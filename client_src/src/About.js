import React, {Component} from 'react';
import Container from '@material-ui/core/Container';
import Dashboard from './Dashboard';
import Title from './Title';

class About extends Component {
  render() {
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
}
export default About;

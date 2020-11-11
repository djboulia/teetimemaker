import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../Dashboard';
import Title from '../Title';
import Container from '@material-ui/core/Container';
import { Button, List, ListItem, ListItemText, ListItemIcon, Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Server from '../utils/Server';
import Formatter from '../utils/Formatter';
import EventIcon from '@material-ui/icons/Event';
import PeopleIcon from '@material-ui/icons/People';
import GolfCourseIcon from '@material-ui/icons/GolfCourse';
import AlarmIcon from '@material-ui/icons/Alarm';

class ReservationDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      details: undefined
    }

    this.getReservation();
  }

  getReservation() {
    let meetupId = this.props.match.params.id;

    Server
      .schedulerGet(meetupId)
      .then((data) => {
        this.setState({ details: data });
      })
      .catch(err => console.log(err));

  }

  onDelete() {
    let meetupId = this.state.details.id;

    Server
      .schedulerDelete(meetupId)
      .then((data) => {
        this
          .props
          .history
          .push('/');
      })
      .catch(err => console.log(err));

  }

  render() {

    const owner = Server.getUser().name;

    if (!this.state.details) {
      return <div>Loading...</div>
    }

    console.log("details " + JSON.stringify(this.state.details));

    const teeTime = Formatter.teeTime(this.state.details.teetime);
    const reserveTime = Formatter.teeTime(this.state.details.scheduled);
    const courses = Formatter.courses(this.state.details.courses);
    const golfers = Formatter.golfers(owner, this.state.details.golfers);

    return (
      <Dashboard>
        <Container maxWidth="md">
          <br />
          <Link to="/">
            <Button
              variant="contained"
              color="secondary">
              Back
            </Button>
          </Link>
          <br />
          <Title>Scheduled Reservation for {owner}</Title>

          <List>
            <ListItem>
              <ListItemIcon color="secondary">
                <EventIcon />
              </ListItemIcon>
              <ListItemText
                primary="Tee Time"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {teeTime.time} on {teeTime.date}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            
            <Divider variant="inset" component="li" />

            <ListItem>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText
                primary="Golfers"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {golfers}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>

            <Divider variant="inset" component="li" />

            <ListItem>
              <ListItemIcon>
                <GolfCourseIcon />
              </ListItemIcon>
              <ListItemText
                primary="Preferred Courses"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {courses}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>

            <Divider variant="inset" component="li" />

            <ListItem>
              <ListItemIcon>
                <AlarmIcon />
              </ListItemIcon>
              <ListItemText
                primary="Tee sheet opens"
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {reserveTime.date}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>

          </List>


          <Button
            variant="contained"
            style={{float:'right', backgroundColor:'red', color:'white'}}
            onClick={this
              .onDelete
              .bind(this)}
          >
            Delete
            </Button>

        </Container>
      </Dashboard>
    )
  }
}

export default ReservationDetails;
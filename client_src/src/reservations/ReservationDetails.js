import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../Dashboard';
import Title from '../Title';
import Container from '@material-ui/core/Container';
import { LinearProgress } from '@material-ui/core';
import { Button, List, ListItem, ListItemText, ListItemIcon, Divider } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Server from '../utils/Server';
import Formatter from '../utils/Formatter';
import EventIcon from '@material-ui/icons/Event';
import PeopleIcon from '@material-ui/icons/People';
import GolfCourseIcon from '@material-ui/icons/GolfCourse';
import AlarmIcon from '@material-ui/icons/Alarm';

export default function ReservationDetails(props) {
  const [details, setDetails] = React.useState(undefined);

  const getReservation = function () {
    let meetupId = props.match.params.id;

    Server
      .schedulerGet(meetupId)
      .then((data) => {
        setDetails(data);
      })
      .catch(err => console.log(err));

  }

  /**
   * fire change events when player list changes
   */
  React.useEffect(() => {
    console.log("ReservationDetails.useEffect: ");

    getReservation();
  }, [])

  const onDelete = function () {
    const meetupId = details.id;

    Server
      .schedulerDelete(meetupId)
      .then((data) => {
        props.history.push('/');
      })
      .catch(err => console.log(err));

  }

    const owner = Server.getUser().name;

    if (!details) {
      return <LinearProgress></LinearProgress>
    }

    console.log("details " + JSON.stringify(details));

    const teeTime = Formatter.teeTime(details.teetime);
    const reserveTime = Formatter.teeTime(details.scheduled);
    const courses = Formatter.courses(details.courses);
    const golfers = Formatter.golfers(owner, details.golfers);

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
            style={{ float: 'right', backgroundColor: 'red', color: 'white' }}
            onClick={onDelete}
          >
            Delete
          </Button>

        </Container>
      </Dashboard>
    )
  }

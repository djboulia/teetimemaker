import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid'
import Dashboard from '../Dashboard';
import Title from '../Title';
import TeeDatePicker from './pickers/TeeDatePicker';
import TeeTimePicker from './pickers/TeeTimePicker';
import CoursePicker from './pickers/CoursePicker';
import PlayerPicker from './pickers/PlayerPicker';
import Server from '../utils/Server';

let tomorrow = function () {
  const date = new Date()

  // Add a day
  date.setDate(date.getDate() + 1)

  return date;
}

export default function AddReservation(props) {
  const [time, setTime] = React.useState("8:00 AM");
  const [date, setDate] = React.useState(tomorrow());
  const [courses, setCourses] = React.useState([]);
  const [golfers, setGolfers] = React.useState([]);

  /**
   * a reservation is valid only when a time/date has been selected along with
   * at least one course.  it's valid to have zero golfers because the owner
   * of the reservation is always considered part of the tee time.
   */
  const isValidReservation = function () {
    return (time !== undefined && date !== undefined && courses.length > 0);
  }

  const onSubmit = function (e) {
    const teetime = time + " " + (date.getMonth() + 1) + "/" + date.getDate() +
      "/" + date.getFullYear();

    console.log("schedulerAdd: " + teetime + ", courses: " +
      JSON.stringify(courses) + ", golfers: " + JSON.stringify(golfers));

    Server.schedulerAdd(teetime, courses, golfers)
      .then(response => {
        props.history.push('/reservations');
      })
      .catch(err =>
        console.log(err)
      );

    e.preventDefault();
  }

  const timeChanged = function (time) {
    console.log("AddReservation - time changed: " + time);
    setTime(time);
  }

  const dateChanged = function (date) {
    console.log("AddReservation - date changed: " + date);
    setDate(date);
  }

  const coursesChanged = function (courses) {
    console.log("AddReservation - course selection changed: " +
      JSON.stringify(courses));

    setCourses(courses);
  }

  const playersChanged = function (players) {
    console.log("AddReservation - players changed: " +
      JSON.stringify(players));
    setGolfers(players);
  }

  return (
    <Dashboard>
      <Container maxWidth="md">
        <br />
        <Link to="/">
          <Button
            variant="contained"
            color="secondary"
          >
            Back
          </Button>
        </Link>
        <br />
        <Title>New Reservation</Title>
        <form onSubmit={onSubmit}>
          <Grid
            container
            spacing={2}
            alignItems='baseline'
          >

            <Grid
              item xs={12}
              sm={3}
            >
              <TeeDatePicker
                label="Date"
                defaultValue={date}
                onChange={dateChanged}
              />

            </Grid>

            <Grid
              item xs={12}
              sm={6}
            >

              <TeeTimePicker
                label="Time"
                value={time}
                onChange={timeChanged}
              />

            </Grid>

            <Grid
              item xs={12}
            >

              <CoursePicker
                onChange={coursesChanged}
              />

            </Grid>

            <Grid
              item xs={12}>

              <PlayerPicker
                owner={Server.getUser()}
                onChange={playersChanged}
              />

            </Grid>

          </Grid>

          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={!isValidReservation()}
          >
            Add
          </Button>
        </form>
      </Container>

    </Dashboard>

  )
}

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

class AddReservation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: "8:00 AM",
      date: tomorrow(),
      courses: [],
      golfers: []
    }

    this.timeChanged = this
      .timeChanged
      .bind(this);

    this.dateChanged = this
      .dateChanged
      .bind(this);

    this.coursesChanged = this
      .coursesChanged
      .bind(this);

    this.playersChanged = this
      .playersChanged
      .bind(this);

  }

  /**
   * a reservation is valid only when a time/date has been selected along with
   * at least one course.  it's valid to have zero golfers because the owner
   * of the reservation is always considered part of the tee time.
   */
  isValidReservation() {
    return (this.state.time !== undefined && this.state.date !== undefined && this.state.courses.length > 0)
      ? true
      : false;
  }

  onSubmit(e) {
    const time = this.state.time;
    const date = this.state.date;
    const teetime = time + " " + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
    const courses = this.state.courses;
    const golfers = this.state.golfers;

    console.log("schedulerAdd: " + teetime + ", courses: " + JSON.stringify(courses) + ", golfers: " + JSON.stringify(golfers));

    Server.schedulerAdd(teetime, courses, golfers)
      .then(response => {
        this.props.history.push('/reservations');
      })
      .catch(err =>
        console.log(err)
      );

    e.preventDefault();
  }

  timeChanged(time) {
    console.log("AddReservation - time changed: " + time);
    this.setState({ time: time });
  }

  dateChanged(date) {
    console.log("AddReservation - date changed: " + date);
    this.setState({ date: date });
  }

  coursesChanged(courses) {
    console.log("AddReservation - course selection changed: " + JSON.stringify(courses));
    this.setState({ courses: courses });
  }

  playersChanged(players) {
    console.log("AddReservation - players changed: " + JSON.stringify(players));
    this.setState({ golfers: players });
  }


  render() {

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
          <Title>New Reservation</Title>
          <form onSubmit={this
            .onSubmit
            .bind(this)}>
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
                  defaultValue={this.state.date}
                  onChange={this.dateChanged} />
              </Grid>

              <Grid
                item xs={12}
                sm={6}
              >
                <TeeTimePicker
                  label="Time"
                  value={this.state.time}
                  onChange={this.timeChanged} />

              </Grid>

              <Grid
                item xs={12}
              >
                <CoursePicker onChange={this.coursesChanged}></CoursePicker>
              </Grid>

              <Grid
                item xs={12}>

                <PlayerPicker owner={Server.getUser()} onChange={this.playersChanged}></PlayerPicker>

              </Grid>

            </Grid>

            <Button variant="contained" color="secondary" type="submit" disabled={!this.isValidReservation()}>Add</Button>
          </form>
        </Container>

      </Dashboard>

    )
  }
}

export default AddReservation;
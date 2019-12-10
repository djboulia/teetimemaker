import React, {Component} from 'react';
import {Row} from 'react-materialize';
import {Link} from 'react-router-dom';
import TeeTimePicker from './TeeTimePicker';
import TeeDatePicker from './TeeDatePicker';
import CoursePicker from './CoursePicker';
import PlayerPicker from './PlayerPicker';
import Server from './Server';

class AddReservation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      time: "8:00 AM",
      date: new Date(),
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
    const teetime = time + " " + (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
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
    this.setState({time: time});
  }

  dateChanged(date) {
    console.log("AddReservation - date changed: " + date);
    this.setState({date: date});
  }

  coursesChanged(courses) {
    console.log("AddReservation - course selection changed: " + JSON.stringify(courses));
    this.setState({courses: courses});
  }

  playersChanged(players) {
    console.log("AddReservation - players changed: " + JSON.stringify(players));
    this.setState({golfers: players});
  }


  render() {

    return (
      <div>
        <br/>
        <Link className="btn" to="/">Back</Link>
        <h1>New Reservation</h1>
        <form onSubmit={this
          .onSubmit
          .bind(this)}>
          <div>
            <Row>

              <TeeDatePicker 
                label="Date"
                defaultValue={this.state.date}
                onChange={this.dateChanged}/>

              <TeeTimePicker 
                label="Time" 
                defaultValue={this.state.time}
                onChange={this.timeChanged}/>

            </Row>
            <Row>
              <CoursePicker onChange={this.coursesChanged}></CoursePicker>
            </Row>
            <Row>
              <PlayerPicker owner={Server.getUser()} onChange={this.playersChanged}></PlayerPicker>
            </Row>
          </div>

          <input type="submit" value="Add" className="btn" disabled={!this.isValidReservation()}/>
        </form>

      </div>

    )
  }
}

export default AddReservation;
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Server from '../utils/Server';
import Formatter from '../utils/Formatter';

class ReservationDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      details: undefined
    }
  }

  componentWillMount() {
    this.getReservation();
  }

  getReservation() {
    let meetupId = this.props.match.params.id;

    Server
      .schedulerGet(meetupId)
      .then((data) => {
        this.setState({details: data});
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
      <div>
        <br/>
        <Link className="btn" to="/">Back</Link>
        <h1>Scheduled Reservation for {owner}</h1>
        <ul className="collection">
          <li className="collection-item avatar">
            <i className="material-icons circle green">event</i>
            <span className="title">Tee Time</span>
            <p> {teeTime.time} on {teeTime.date} </p>
          </li>

          <li className="collection-item avatar">
            <i className="material-icons circle blue">group</i>
            <span className="title">Golfers</span>
            <p> {golfers}</p>
          </li>

          <li className="collection-item avatar">
            <i className="material-icons circle green">location_on</i>
            <span className="title">Preferred Courses</span>
            <p> {courses}</p>
          </li>

          <li className="collection-item avatar">
            <i className="material-icons circle blue">alarm</i>
            <span className="title">Tee sheet opens</span>
            <p> {reserveTime.date} </p>
          </li>

        </ul>

        <button
          onClick={this
          .onDelete
          .bind(this)}
          className="btn red right">Delete</button>
      </div>
    )
  }
}

export default ReservationDetails;
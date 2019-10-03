import React, {Component} from 'react';
import {Row} from 'react-materialize';
import axios from 'axios';
import {Link} from 'react-router-dom';
import ServerUrl from './ServerUrl';
import TeeTimePicker from './TeeTimePicker';
import TeeDatePicker from './TeeDatePicker';
import CoursePicker from './CoursePicker';
import PlayerPicker from './PlayerPicker';

class AddReservation extends Component {
  addMeetup(newMeetup) {
    axios.request({
      method: 'post',
      url: ServerUrl.getUrl('meetups'),
      data: newMeetup
    }).then(response => {
      this
        .props
        .history
        .push('/');
    }).catch(err => console.log(err));
  }

  onSubmit(e) {
    const newMeetup = {
      name: this.refs.name.value,
      city: this.refs.city.value,
      address: this.refs.address.value
    }
    this.addMeetup(newMeetup);
    e.preventDefault();
  }

  render() {

    return (
      <div>
        <br/>
        <Link className="btn grey" to="/">Back</Link>
        <h1>New Reservation</h1>
        <form onSubmit={this
          .onSubmit
          .bind(this)}>
          <div>
            <Row>
              {/* <TeeDatePicker label="Date"/>
              <TeeTimePicker label="Time"></TeeTimePicker> */}
            </Row>
            <Row>
              <CoursePicker></CoursePicker>
            </Row>
            <Row>
              <PlayerPicker></PlayerPicker>
            </Row>
          </div>

          <input type="submit" value="Save" className="btn"/>
        </form>

      </div>

    )
  }
}

export default AddReservation;
import React, {Component} from 'react';
import ReservationItem from './ReservationItem';
import Server from './Server';
import { Link } from 'react-router-dom';

class Reservations extends Component {
  constructor() {
    super();
    this.state = {
      teetimes: []
    }
  }

  componentWillMount() {
    this.getTeeTimes();
  }

  getTeeTimes() {
    Server.schedulerList()
      .then(data => {
        this.setState({
          teetimes: data
        }, () => {
          //console.log(this.state);
        })
      })
      .catch(err => console.log(err));
  }

  render() {

    const teetimes = this
      .state
      .teetimes
      .map((teetime, i) => {
        return (<ReservationItem key={teetime.id} owner={Server.getName()} item={teetime}/>)
      })

    return (
      <div>
        <h1>Upcoming Reservations for {Server.getName()}</h1>
        <table>
          <thead>
            <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Golfers</th>
            <th>Course Preference</th>
            </tr>
          </thead>
          <tbody>
          {teetimes}
          </tbody>
        </table>

        <div className="fixed-action-btn">
          <Link to="/reservations/add" className="btn-floating btn-large red">
            <i className="fa fa-plus"></i>
          </Link>
        </div>
      </div>
    )
  }
}

export default Reservations;
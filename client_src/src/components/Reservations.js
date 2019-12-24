import React, {Component} from 'react';
import ReservationItem from './ReservationItem';
import Server from '../utils/Server';
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

        // sort closest upcoming dates first
        data.sort((a, b) => {
          const aTime = new Date(a.teetime);
          const bTime = new Date(b.teetime);

          return (aTime.getTime() - bTime.getTime()); 
        });

        this.setState({
          teetimes: data
        }, () => {
          //console.log(this.state);
        })
      })
      .catch(err => console.log(err));
  }

  render() {
    const owner = Server.getUser().name;

    const teetimes = (this.state.teetimes.length > 0) 
      ? this
      .state
      .teetimes
      .map((teetime, i) => {
        return (<ReservationItem key={teetime.id} owner={owner} item={teetime}/>)
      })
      : <tr><td></td><td>No upcoming reservations found.</td><td><a href="/reservations/add">Add a reservation.</a></td></tr>

    return (
      <div>
        <h1>Reservations for {owner}</h1>
        <h4>Pending requests</h4>
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
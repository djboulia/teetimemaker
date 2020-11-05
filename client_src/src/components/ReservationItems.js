import React, {Component} from 'react';
import ReservationItem from './ReservationItem';
import Server from '../utils/Server';

class ReservationItems extends Component {

  constructor(props) {
    super(props);
    this.state = {
      owner: props.owner,
      teetimes: []
    }
  }

  componentWillMount() {
    this.getTeeTimes();
  }

  getTeeTimes() {
    Server
      .schedulerList()
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
    const owner = this.state.owner;
    const teetimes = this.state.teetimes;

    const reservations = (teetimes.length > 0)
      ? this
        .state
        .teetimes
        .map((teetime, i) => {
          return (<ReservationItem key={teetime.id} owner={owner} item={teetime}/>)
        })
      : <tr>
        <td></td>
        <td>No upcoming reservations found.</td>
        <td>
          <a href="/reservations/add">Add a reservation.</a>
        </td>
      </tr>

    return (
      <div>
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
            {reservations}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ReservationItems;
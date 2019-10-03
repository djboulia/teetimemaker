import React, {Component} from 'react';
import axios from 'axios';
import ReservationItem from './ReservationItem';
import ServerUrl from './ServerUrl';
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
    axios
      .get(ServerUrl.getUrl('meetups'))
      .then(response => {
        this.setState({
          teetimes: response.data
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
        return (<ReservationItem key={teetime.id} item={teetime}/>)
      })

    return (
      <div>
        <h1>Reservations</h1>
        <ul className="collection">
          {teetimes}
        </ul>
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
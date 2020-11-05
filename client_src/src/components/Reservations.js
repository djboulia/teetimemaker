import React, {Component} from 'react';
import ReservationItems from './ReservationItems';
import Server from '../utils/Server';
import {Link} from 'react-router-dom';

class Reservations extends Component {

  render() {
    const owner = Server
      .getUser()
      .name;

    return (
      <div>
        <h1>Reservations for {owner}</h1>
        <h4>Pending requests</h4>

        <ReservationItems owner={owner}></ReservationItems>

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
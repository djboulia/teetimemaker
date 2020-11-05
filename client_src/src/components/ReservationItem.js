import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import Formatter from '../utils/Formatter';

class ReservationItem extends Component{
  constructor(props){
    super(props);
    this.state = {
      item:props.item,
      owner:props.owner
    }
  }

  render(){
    const reservation = Formatter.teeTime(this.state.item.teetime);
    const courses = Formatter.courses(this.state.item.courses);
    const golfers = Formatter.golfers(this.state.owner, this.state.item.golfers);

    return (
      <tr>
        <td>
        <Link to={`/reservations/${this.state.item.id}`}>{reservation.date}</Link>
        </td>
        <td>
        <Link to={`/reservations/${this.state.item.id}`}>{reservation.time}</Link>
        </td>
        <td>
          {golfers}
        </td>
        <td>
          {courses}
        </td>
      </tr>
    )
  }
}

export default ReservationItem;
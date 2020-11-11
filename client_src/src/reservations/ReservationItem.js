import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
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
      <TableRow>
        <TableCell>
        <Link to={`/reservations/${this.state.item.id}`}>{reservation.date}</Link>
        </TableCell>
        <TableCell>
        <Link to={`/reservations/${this.state.item.id}`}>{reservation.time}</Link>
        </TableCell>
        <TableCell>
          {golfers}
        </TableCell>
        <TableCell>
          {courses}
        </TableCell>
      </TableRow>
    )
  }
}

export default ReservationItem;
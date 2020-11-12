import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Formatter from '../utils/Formatter';

export default function ReservationItem(props) {
  const item = props.item;
  const owner = props.owner;
  const reservation = Formatter.teeTime(item.teetime);
  const courses = Formatter.courses(item.courses);
  const golfers = Formatter.golfers(owner, item.golfers);

  return (
    <TableRow>
      <TableCell>
        <Link to={`/reservations/${item.id}`}>{reservation.date}</Link>
      </TableCell>
      <TableCell>
        <Link to={`/reservations/${item.id}`}>{reservation.time}</Link>
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

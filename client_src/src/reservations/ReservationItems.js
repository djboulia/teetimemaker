import React, { Component } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ReservationItem from './ReservationItem';
import Server from '../utils/Server';

class ReservationItems extends Component {

  constructor(props) {
    super(props);
    this.state = {
      owner: props.owner,
      teetimes: []
    }

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
          return (<ReservationItem key={teetime.id} owner={owner} item={teetime} />)
        })
      : <TableRow>
        <TableCell></TableCell>
        <TableCell>No upcoming reservations found.</TableCell>
        <TableCell><a href="/reservations/add">Add a reservation.</a></TableCell>
      </TableRow>

    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Golfers</TableCell>
            <TableCell>Course Preference</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations}
        </TableBody>
      </Table>
    )
  }
}

export default ReservationItems;
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ReservationItem from './ReservationItem';
import Server from '../utils/Server';

export default function ReservationItems(props) {
  const [teetimes, setTeetimes] = React.useState([]);

  /**
   * get tee times for this user
   */
  React.useEffect(() => {
    console.log("ReservationItems.useEffect: ");

    Server.schedulerList()
      .then(data => {

        // sort closest upcoming dates first
        data.sort((a, b) => {
          const aTime = new Date(a.teetime);
          const bTime = new Date(b.teetime);

          return (aTime.getTime() - bTime.getTime());
        });

        setTeetimes(data);
      })
      .catch(err => console.log(err));
  }, [])


  const reservations = (teetimes.length > 0)
    ? teetimes
      .map((teetime, i) => {
        return (<ReservationItem key={teetime.id} owner={props.owner} item={teetime} />)
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

import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InfoIcon from '@material-ui/icons/Info';
import AlarmIcon from '@material-ui/icons/Alarm';
import AlarmAddIcon from '@material-ui/icons/AlarmAdd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Divider } from '@material-ui/core';


export const mainListItems = (
  <div>
    <ListItem button component="a" href="/reservations">
      <ListItemIcon>
        <AlarmIcon />
      </ListItemIcon>
      <ListItemText primary="Reservations" />
    </ListItem>

    <ListItem button component="a" href="/reservations/add">
      <ListItemIcon>
        <AlarmAddIcon />
      </ListItemIcon>
      <ListItemText primary="Add Reservation" />
    </ListItem>

    <ListItem button component="a" href="/about">
      <ListItemIcon>
        <InfoIcon />
      </ListItemIcon>
      <ListItemText primary="About" />
    </ListItem>

    <Divider variant="inset" component="li" />

    <ListItem button component="a" href="/logout">
      <ListItemIcon>
        <ExitToAppIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  </div>
);

import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

/**
 * build the list of valid tee times. 10 minute intervals
 * starting at 8am, ending at 6pm
 */
function getTimes() {
  let hours,
    minutes;

  // tee times can only be booked at 10 minute intervals
  let intervals = [
    "00",
    "10",
    "20",
    "30",
    "40",
    "50"
  ];

  let times = [];

  // AM tee times start at 8am
  for (hours = 8; hours < 12; hours++) {
    for (minutes = 0; minutes < intervals.length; minutes++) {
      times.push(hours + ":" + intervals[minutes] + " AM")
    }
  }

  // noon is special case
  for (minutes = 0; minutes < intervals.length; minutes++) {
    times.push("12:" + intervals[minutes] + " PM")
  }

  // PM tee times end at 6pm
  for (hours = 1; hours < 6; hours++) {
    for (minutes = 0; minutes < intervals.length; minutes++) {
      times.push(hours + ":" + intervals[minutes] + " PM")
    }
  }

  return times;
}

export default function TeeTimePicker(props) {
  const times = getTimes();
  const value = (props.value) ? props.value : times[0];

  const handleSelectionChanged = function (e) {
    console.log("TeeTimePicker: selection changed: " + e.target.value);

    if (props.onChange) {
      props.onChange(e.target.value);
    }
  }

  return (
    <FormControl>
      <InputLabel shrink>
        {props.label}
      </InputLabel>
      <Select
        value={value}
        onChange={handleSelectionChanged}
      >
        {times.map(item => (
          <MenuItem key={item} value={item}>{item}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

}
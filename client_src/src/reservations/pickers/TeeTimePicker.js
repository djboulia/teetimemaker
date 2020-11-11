import React, { Component, Fragment } from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

class TeeTimePicker extends Component {
  constructor(props) {
    super(props);

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

  }

  handleSelectionChanged(e) {
    console.log("TeeTimePicker: selection changed: " + e.target.value);

    if (this.props.onChange) {
      this
        .props
        .onChange(e.target.value);
    }
  }

  getTimes() {
    let hours,
      minutes;

    // tee times can only be booked at 10 minute interfvals
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

  render() {

    const times = this.getTimes();
    const value = (this.props.value)
      ? this.props.value
      : times[0];

    return (
      <FormControl>
        <InputLabel shrink>
          {this.props.label}
        </InputLabel>
        <Select
          value={value}
          onChange={this.handleSelectionChanged}
        >
          {times.map(item => (
            <MenuItem key={item} value={item}>{item}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
}

export default TeeTimePicker;
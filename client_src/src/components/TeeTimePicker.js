import React, {Component, Fragment} from 'react';
import {Input} from 'react-materialize';

class TeeTimePicker extends Component {

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

    let times = this.getTimes();
    let defaultValue = (this.props.defaultValue)
      ? this.props.defaultValue
      : times[0];

    return (
      <Input type='select' label={this.props.label} defaultValue={defaultValue}>
        {times.map(item => (
          <Fragment key={item}>
            <option value={item}>{item}</option>
          </Fragment>
        ))}
      </Input>
    )
  }
}

export default TeeTimePicker;
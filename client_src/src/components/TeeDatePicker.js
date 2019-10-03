import React, {Component} from 'react';
import {Input} from 'react-materialize';

class TeeDatePicker extends Component {

  render() {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    const daysOfWeek = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ];

    const theDate = new Date();
    const today = daysOfWeek[theDate.getDay()] + ", " + months[theDate.getMonth()] +  " " + theDate.getDate() + ", " + theDate.getFullYear();
    
    // format date, set weeks starting on Monday, no prior dates allowed
    const opts = {
      format: 'ddd, mmm dd, yyyy',
      firstDay: 1,
      min: new Date()
    };

    return (<Input type="date" label={this.props.label} options={opts} defaultValue={today}/>)
  }
}

export default TeeDatePicker;
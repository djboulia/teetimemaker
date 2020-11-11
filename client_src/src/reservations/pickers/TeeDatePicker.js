import React, { Component } from 'react';
import { DatePicker } from '@material-ui/pickers';

/**
 * props supported:
 *  defaultValue - date object - if supplied, the initial date to set (month ,day, year will be used)
 *  onChange - function - if supplied, will be called when a new date is selected
 */
class TeeDatePicker extends Component {
  constructor(props) {
    super(props);

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

  }

  handleSelectionChanged(e) {
    console.log("TeeDatePicker: date changed: " + e);
 
    if (this.props.onChange) {
      // comes in as ms since Jan 1970, pass back a Date object
      this.props.onChange(new Date(e));
    }
  }

  render() {

    const theDate = (this.props.defaultValue)
      ? this.props.defaultValue
      : new Date();

    return (<DatePicker
      label={this.props.label}
      format={'ddd, MMM DD, yyyy'}
      minDate={new Date()}
      value={theDate}
      onChange={this.handleSelectionChanged} />)
  }
}

export default TeeDatePicker;
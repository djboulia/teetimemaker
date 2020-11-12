import React, { Component } from 'react';
import { DatePicker } from '@material-ui/pickers';

/**
 * props supported:
 *  defaultValue - date object - if supplied, the initial date to set (month ,day, year will be used)
 *  onChange - function - if supplied, will be called when a new date is selected
 */
export default function TeeDatePicker(props) {

  const handleSelectionChanged = function (e) {
    console.log("TeeDatePicker: date changed: " + e);

    if (props.onChange) {
      // comes in as ms since Jan 1970, pass back a Date object
      props.onChange(new Date(e));
    }
  }

  const theDate = (props.defaultValue) ? props.defaultValue : new Date();

  return (
    <DatePicker
      label={props.label}
      format={'ddd, MMM DD, yyyy'}
      minDate={new Date()}
      value={theDate}
      onChange={handleSelectionChanged}
    />)
}

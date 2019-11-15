import React, {Component} from 'react';
import {DatePicker} from 'react-materialize';

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
      this
      .props
      .onChange(e);
    }
  }

  render() {

    const theDate = (this.props.defaultValue) 
                      ? this.props.defaultValue 
                      : new Date();
    
    // format date, set weeks starting on Monday, no prior dates allowed
    const opts = {
      format: 'ddd, mmm dd, yyyy',
      firstDay: 1,
      minDate: new Date(),
      defaultDate: theDate,
      setDefaultDate: true
    };

    return (<DatePicker 
        label={this.props.label} 
        options={opts}
        onChange={this.handleSelectionChanged}/>)
  }
}

export default TeeDatePicker;
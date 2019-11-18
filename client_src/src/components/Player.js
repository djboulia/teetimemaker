import React, {Component} from 'react';
import {TextInput, Select, Row} from 'react-materialize';
import PlayerSearchModal from './PlayerSearchModal';
import '../App.css';

class Player extends Component {

  constructor(props) {
    super(props);

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

    this.handleModalClosed = this
      .handleModalClosed
      .bind(this);
  }

  handleSelectionChanged(e) {
    console.log("Player: selection changed");

    if (this.props.onChange) {
      this
      .props
      .onChange(e);
    }
  }

  createSelectItems() {
    let items = [];

    if (!this.props.self) {
      for (let i = 0; i < this.props.choices.length; i++) {
        var choice = this.props.choices[i];

        items.push(
          <option key={i} value={choice.id}>{choice.name}</option>
        );
      }
    }

    return items;
  }

  /**
   * we bubble up the modal result to the parent object
   */
  handleModalClosed(player) {
    if (this.props.onChangeSearch) {
      this.props.onChangeSearch(player);
    }
  }

  
  render() {

    let input = null;
    let defaultId = (this.props.defaultValue) ? this.props.defaultValue.id : '';

    if (this.props.self) {
      console.log("Player: self defaultValue: " + this.props.name)
      input = (
        <div>
          <TextInput s={6} id={this.props.id} type="text" defaultValue={this.props.name} disabled/>
        </div>
      )

    } else {
      console.log("Player: render defaultValue " + JSON.stringify(this.props.defaultValue));
      console.log("choices " + JSON.stringify(this.props.choices));
  
      // editable input field has select-able options and a search button
      input = (
        <div>
          <Select
            s={6}
            id={this.props.id}
            value={defaultId}
            onChange={this.handleSelectionChanged}>
            {this.createSelectItems()}
          </Select>

          <PlayerSearchModal 
            onClose={this.handleModalClosed}>
          </PlayerSearchModal>
        </div>
      )
    }

    return (
      <Row>
        {input}
      </Row>
    )
  }
}

export default Player;
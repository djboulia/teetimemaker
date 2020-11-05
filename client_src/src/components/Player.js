import React, {Component} from 'react';
import {TextInput, Select, Row} from 'react-materialize';
import PlayerSearchModal from './PlayerSearchModal';
import '../App.css';

/**
 * This component accepts the following optional properties:
 *  id {String} id for this component
 *  self {boolean} if provided, indicates this player is tee time owner and can't be modified
 *  value {Object} the player for this component
 *  onChange  {Function} fired when the dropdown selection changes
 *  onFilterSearch {Function} to modify the search results before they are displayed
 *  onChangeSearch {Function} fired when a search results in a change
 */
class Player extends Component {
  constructor(props) {
    super(props);

    this.onChangeSearch = this
      .onChangeSearch
      .bind(this);
  }

  createSelectItems() {
    let items = [];

    if (!this.props.self) {
      for (let i = 0; i < this.props.choices.length; i++) {
        var choice = this.props.choices[i];

        items.push(
          <option key={i} value={choice.username}>{choice.name}</option>
        );
      }
    }

    return items;
  }

  onChangeSearch(player) {
    console.log("Player.onChangeSearch: ", player);

    // fake up a change event when the search changes
    if (this.props.onChange) {
      const e = {
        target : {
          id: this.props.id,
          value: player.username
        }
      };

      this.props.onChange(e);
    }
  }

  render() {

    let input = null;
    const player = (this.props.value) ? this.props.value : undefined;
    const username = (player) ? player.username : '';
    // console.log("Player: searchResults ", this.props.searchResults);

    if (this.props.self) {
      console.log("Player: self value: " + JSON.stringify(player))
      input = (
        <div>
          <TextInput s={6} id={this.props.id} type="text" defaultValue={player.name} disabled/>
        </div>
      )

    } else {
      console.log("Player: render value " + JSON.stringify(player));
      // console.log("choices " + JSON.stringify(this.props.choices));
  
      // editable input field has select-able options and a search button
      input = (
        <div>
          <Select
            s={6}
            id={this.props.id}
            value={username}
            onChange={this.props.onChange}>
            {this.createSelectItems()}
          </Select>

          <PlayerSearchModal 
            searchResults={this.props.searchResults}
            onClose={this.onChangeSearch}
            onSearchResults={this.props.onSearchResults}>
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
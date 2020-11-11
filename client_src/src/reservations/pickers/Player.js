import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import PlayerSearchModal from './PlayerSearchModal';

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

    this.onChange = this
      .onChange
      .bind(this);

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
          <MenuItem key={i} value={choice.username}>{choice.name}</MenuItem>
        );
      }
    }

    return items;
  }

  onChange(event) {
    console.log("Player: select clicked: ", JSON.stringify(event.target));

    // fire a change event when the selection changes
    if (this.props.onChange) {
      const e = {
        target: {
          id: this.props.id,
          value: event.target.value
        }
      };

      this.props.onChange(e);
    }
  }

  onChangeSearch(player) {
    console.log("Player.onChangeSearch: ", player);

    // fire a change event when the search changes
    if (this.props.onChange) {
      const e = {
        target: {
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
      return (
        <Grid container direction="row">
          <Grid
            item
            xs={12}
            sm={3}
          >
            <TextField disabled
              style={{ minWidth: '90%' }}
              id={this.props.id}
              defaultValue={player.name} />
          </Grid>
        </Grid>
      )

    } else {
      console.log("Player: render value " + JSON.stringify(player));
      // console.log("choices " + JSON.stringify(this.props.choices));

      // editable input field has select-able options and a search button
      return (
        <Grid container direction="row">
          <Grid
            item
            xs={12}
            sm={3}
          >
            <Select
              id={this.props.id}
              value={username}
              style={{ minWidth: '90%' }}
              onChange={this.onChange}>
              {this.createSelectItems()}
            </Select>
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
          >
            <PlayerSearchModal
              searchResults={this.props.searchResults}
              searchInProgress={this.props.searchInProgress}
              onClose={this.onChangeSearch}
              onSearch={this.props.onSearch}>
            </PlayerSearchModal>
          </Grid>
        </Grid>
      );
    }
  }
}

export default Player;
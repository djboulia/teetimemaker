import React from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import PlayerSearchModal from './PlayerSearchModal';

/**
 * Outer formatting for player component
 * 
 * @param {Object} props 
 */
function PlayerContainer(props) {
  return (
    <Grid container direction="row">
      {props.children}
    </Grid>
  );
}

/**
 * Item formatting for each element of a player component
 * 
 * @param {Object} props 
 */
function PlayerContainerItem(props) {
  return (
    <Grid
      item
      xs={12}
      sm={3}
    >
      {props.children}
    </Grid>
  );
}

/**
 * The tee time owner is an unchangeable member of the foursome
 * 
 * @param {Object} props properties: id, name
 * @property id: the id of this player component
 * @property name: the name to display in the player component
 */
function Self(props) {
  return (
    <PlayerContainer>
      <PlayerContainerItem>

        <TextField disabled
          style={{ minWidth: '90%' }}
          id={props.id}
          defaultValue={props.name} />

      </PlayerContainerItem>
    </PlayerContainer>
  );
}

/**
 * This component accepts the following optional properties:
 *  id {String} id for this component
 *  self {boolean} if provided, indicates this player is tee time owner and can't be modified
 *  value {Object} the player for this component
 *  onChange  {Function} fired when the dropdown selection changes
 *  onFilterSearch {Function} to modify the search results before they are displayed
 *  onChangeSearch {Function} fired when a search results in a change
 */
export default function Player(props) {
  const player = (props.value) ? props.value : undefined;
  const username = (player) ? player.username : '';
  // console.log("Player: searchResults ", props.searchResults);

  const onChange = function (event) {
    console.log("Player: select clicked: ", JSON.stringify(event.target));

    // fire a change event when the selection changes
    if (props.onChange) {
      const e = {
        target: {
          id: props.id,
          value: event.target.value
        }
      };

      props.onChange(e);
    }
  }

  const onChangeSearch = function (player) {
    console.log("Player.onChangeSearch: ", player);

    // fire a change event when the search changes
    if (props.onChange) {
      const e = {
        target: {
          id: props.id,
          value: player.username
        }
      };

      props.onChange(e);
    }
  }

  const createSelectItems = function () {
    let items = [];

    if (props.choices) {
      for (let i = 0; i < props.choices.length; i++) {
        var choice = props.choices[i];

        items.push(
          <MenuItem key={i} value={choice.username}>{choice.name}</MenuItem>
        );
      }
    }

    return items;
  }

  if (props.self) {
    console.log("Player: self value: " + JSON.stringify(player))

    return <Self id={props.id} name={player.name} />;
  }

  console.log("Player: render value " + JSON.stringify(player));
  // console.log("choices " + JSON.stringify(props.choices));

  // editable input field has select-able options and a search button
  return (
    <PlayerContainer>
      <PlayerContainerItem>

        <Select
          id={props.id}
          value={username}
          style={{ minWidth: '90%' }}
          onChange={onChange}>
          {createSelectItems()}
        </Select>

      </PlayerContainerItem>

      <PlayerContainerItem>

        <PlayerSearchModal
          searchResults={props.searchResults}
          searchInProgress={props.searchInProgress}
          onClose={onChangeSearch}
          onSearch={props.onSearch}>
        </PlayerSearchModal>

      </PlayerContainerItem>
    </PlayerContainer>
  );

}
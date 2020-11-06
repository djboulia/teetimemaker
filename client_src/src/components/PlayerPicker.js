import React, { Component } from 'react';
import { Table } from 'react-materialize';
import '../App.css';
import Player from './Player';
import PlayerUtils from '../utils/PlayerUtils';
import Buddies from '../utils/Buddies';
import PlayerSearch from '../utils/PlayerSearch';

/**
 * return true if the buddy exists in our list. check the owner id as well
 */
const isBuddy = function (player, owner, buddies) {

  // count the tee time owner as a buddy
  if (PlayerUtils.isSamePlayer(player, owner)) {
    return true;
  }

  let found = false;

  for (let i = 0; i < buddies.length; i++) {
    const buddy = buddies[i];

    if (PlayerUtils.isSamePlayer(buddy, player)) {
      found = true;
      break;
    }
  }

  return found;
}

const isInFoursome = function (player, owner, foursome) {
  // count the tee tiee owner as part of the foursome
  if (PlayerUtils.isSamePlayer(player, owner)) {
    return true;
  }

  let found = false;

  for (let i = 0; i < foursome.length; i++) {
    const golfer = foursome[i];

    if (PlayerUtils.isSamePlayer(golfer, player)) {
      found = true;
      break;
    }
  }

  return found;
}

class PlayerPicker extends Component {

  constructor(props) {
    super(props);

    this.state = {
      owner: props.owner, // owner of this tee time is always the first player
      players: [],
      searchResults: [],
      searching: undefined
    };

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

    this.searchComplete = this
      .searchComplete
      .bind(this);

    this.handleSearch = this
      .handleSearch
      .bind(this);

    this.getChoices = this
      .getChoices
      .bind(this);
  }

  findPlayer(id) {
    const buddies = Buddies.get();
    console.log("findPlayer: buddies " + JSON.stringify(buddies));

    let player = PlayerUtils.findById(buddies, id);
    if (player) {
      return player;
    }

    // if we didn't find them in our buddy list, look in search
    // results
    const searchResults = this.state.searchResults;

    player = PlayerUtils.findById(searchResults, id);
    if (player) {
      return player;
    }

    console.log("Warning! id " + id + " not found!");
    return PlayerUtils.getEmptyPlaceHolder();
  }

  /**
   * funnel all state changes through this method so that 
   * we fire an appropriate onChange event when state changes
   * 
   * @param {Object} state new state to set
   */
  stateChange(state) {
    this.setState(state, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.players);
      }
    });
  }

  handleSelectionChanged(e) {
    console.log("handleSelectionChanged event : " + JSON.stringify(e.target.id));
    console.log("changed! " + e.target.value);

    const prefix = "Player_";

    const owner = this.state.owner;
    console.log("self:" + JSON.stringify(owner));

    if (e.target.id.startsWith(prefix)) {
      let id = e
        .target
        .id
        .substring(prefix.length);

      if (id >= 0 || id < 3) {
        console.log(JSON.stringify(this.state.players));

        let player = this.findPlayer(e.target.value);
        console.log("found player: " + JSON.stringify(player));

        let players = this.state.players;
        if (id >= players.length) {
          // add it to the end
          if (!PlayerUtils.isEmpty(player) && !PlayerUtils.isSamePlayer(player, owner)) {
            players.push(player);
          }
        } else {
          if (PlayerUtils.isEmpty(player) || PlayerUtils.isSamePlayer(player, owner)) {
            // remove the entry
            players.splice(id, 1);
          } else {
            // replace the entry
            players[id] = player;
          }
        }

        // could be a totally new player added to the list.
        // look for that here, add it to our "buddies" list if so
        const buddies = Buddies.get();

        if (!PlayerUtils.isEmpty(player) && !isBuddy(player, owner, buddies)) {
          console.log("adding buddy : " + JSON.stringify(player));
          Buddies.add(player);
        }

        console.log("players: " + JSON.stringify(players));

        this.stateChange({ players: players });
      }
    }
  }

  /**
   * look for players already in our foursome and remove them from the search results
   * 
   * @param {Array} results list of players resulting from the search
   */
  filterResults(results) {
    const players = this.state.players;
    const owner = this.state.owner;

    const filteredResults = [];

    //results should be an array of current search results.
    for (let i = 0; i < results.length; i++) {
      const player = results[i];

      if (!isInFoursome(player, owner, players)) {
        filteredResults.push(player);
      } else {
        console.log("Player " + player.name + " is already in foursome...removing from search list.");
      }
    }

    console.log("filterResults returning: " + JSON.stringify(filteredResults));
    return filteredResults;
  }

  searchComplete(results) {
    // set the search results and stop searching
    console.log("search complete: ", results);
    this.stateChange({ searchResults: results, searching: undefined });
  }

  /**
   * called whenever a new search is executed.  we save the state so we can
   * present prior searches the next time the search dialog is presented
   * 
   * @param {Array} results list of players resulting from the search
   */
  handleSearch(searchtext) {
    let searching = this.state.searching;
    if (searching) {  // cancel in progress search before doing a new one
      searching.cancel();
    }

    searching = new PlayerSearch(searchtext);
    searching.doSearch(this.searchComplete);

    this.stateChange({ searchResults: [], searching: searching });
  }

  getChoices(player) {
    // build a list of drop down choices for this selection
    const buddies = Buddies.get();
    const available = PlayerUtils.getEmptyPlaceHolder();

    const items = [];
    items.push(available);  // first choice is always the available slot

    if (!PlayerUtils.isEmpty(player)) { // if this is a valid player, add it to the list
      items.push(player);
    }

    const buddylist = this.filterResults(buddies);
    return items.concat(buddylist);
  }

  render() {
    console.log("PlayerPicker: render");
    console.log("players: " + JSON.stringify(this.state.players));

    const players = this.state.players;
    const searchResults = this.filterResults(this.state.searchResults);
    const searchInProgress = (this.state.searching) ? true : false;
    const getChoices = this.getChoices;
    const handleSelectionChanged = this.handleSelectionChanged;
    const handleSearch = this.handleSearch;

    const foursome = [];
    const available = PlayerUtils.getEmptyPlaceHolder();

    for (let i = 0; i < players.length; i++) {
      let player = players[i];

      foursome.push(player);
    }

    if (players.length < 3) {
      let i;

      for (i = 0; i < (3 - players.length); i++) {
        foursome.push(available);
      }
    }

    return (
      <div>

        <Table>
          <thead>
            <tr>
              <th data-field="pos"></th>
              <th data-field="name">Players</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>1</td>
              <td>
                <Player value={this.state.owner} self="true"></Player>
              </td>
            </tr>

            {foursome
              .map(function (player, index) {

                return <tr key={index}>
                  <td style={{
                    padding: 0
                  }}>{index + 2}</td>
                  <td style={{
                    padding: 0
                  }}>
                    <Player
                      id={"Player_" + index}
                      value={player}
                      choices={getChoices(player)}
                      searchResults={searchResults}
                      searchInProgress={searchInProgress}
                      onChange={handleSelectionChanged}
                      onSearch={handleSearch}>
                    </Player>
                  </td>
                </tr>

              })}

          </tbody>
        </Table>

      </div>
    )
  }
}

export default PlayerPicker;
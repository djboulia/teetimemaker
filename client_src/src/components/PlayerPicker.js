import React, {Component} from 'react';
import {Table} from 'react-materialize';
import '../App.css';
import Player from './Player';
import Buddies from '../utils/Buddies';

const isSameId = function( id1, id2) {
  return (id1 === id2);
}

const isSamePlayer = function( player1, player2) {
  return (isSameId(player1.username, player2.username));
}

const validBuddy = function (buddy, player, foursome) {
  if (isSamePlayer(buddy, player)) {
    // always include the active player in the list
    return true;
  }

  // look at other players already in the foursome and take those out of the
  // buddies choices

  for (let i = 0; i < foursome.length; i++) {
    const currentPlayer = foursome[i];

    if (isSamePlayer(buddy, currentPlayer)) {
      return false;
    }

  }

  return true;
}

/**
 * return true if the buddy exists in our list. check the owner id as well
 */
const isBuddy = function (player, owner, buddies) {
  // count the tee time owner as a buddy
  if (isSamePlayer(player, owner)) {
    return true;
  }

  let found = false;

  for (let i = 0; i < buddies.length; i++) {
    const buddy = buddies[i];

    if (isSamePlayer(buddy, player)) {
      found = true;
      break;
    }
  }

  return found;
}

const isInFoursome = function (player, owner, foursome) {
  // count the tee tiee owner as part of the foursome
  if (isSamePlayer(player, owner)) {
    return true;
  }

  let found = false;

  for (let i = 0; i < foursome.length; i++) {
    const golfer = foursome[i];

    if (isSamePlayer(golfer, player)) {
      found = true;
      break;
    } 
  }

  return found;
}

const available = {
  name: "Available",
  username: "----"
};


class PlayerPicker extends Component {

  constructor(props) {
    super(props);

    this.state = {
      owner: props.owner, // owner of this tee time is always the first player
      players: [],
      searchResults: []
    };

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

      this.handleSearchResults = this
      .handleSearchResults
      .bind(this);

  }

  findPlayer(username) {
    const buddies = Buddies.get();

    console.log("findPlayer: buddies " + JSON.stringify(buddies));

    for (let i = 0; i < buddies.length; i++) {
      const buddy = buddies[i];

      if (isSameId(buddy.username, username)) {
        return buddy;
      }
    }

    // if we didn't find them in our buddy list, look in search
    // results
    const searchResults = this.state.searchResults;
    for (let i = 0; i < searchResults.length; i++) {
      const result = searchResults[i];

      if (isSameId(result.username, username)) {
        return result;
      }
    }

    console.log("Warning! username " + username + " not found!");
    return available;
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
    console.log("self:" +JSON.stringify(owner));

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
          if (player.name !== "Available" && !isSamePlayer(player, owner)) {
            players.push(player);
          }
        } else {
          if (player.name === "Available" || isSamePlayer(player, owner)) {
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

        if (!isBuddy(player, owner, buddies)) {
          console.log("adding buddy : " + JSON.stringify(player));
          Buddies.add(player);
        }

        console.log("players: " + JSON.stringify(players));

        this.stateChange({players: players});
      }
    }
  }

  /**
   * look for players already in our foursome and remove them from the search results
   * 
   * @param {Array} results list of players resulting from the search
   */
  filterSearchResults(results) {
    const players = this.state.players;
    const owner = this.state.owner;

    const filteredResults = [];

    //results should be an array of current search results.
    for (let i=0; i<results.length; i++) {
      const player = results[i];

      if (!isInFoursome(player, owner, players)) {
        filteredResults.push(player);
      } else {
        console.log("Player " + player.name + " is already in foursome...removing from search list.");
      }
    }

    console.log("filterSearchzResults returning: " + JSON.stringify(filteredResults));
    return filteredResults;
  }

  /**
   * called whenever a new search is executed.  we save the state so we can
   * present prior searches the next time the search dialog is presented
   * 
   * @param {Array} results list of players resulting from the search
   */
  handleSearchResults(results) {
    // remember last search results for next search
    this.setState({searchResults: results});
  }

  getChoices(player, players, buddies) {
    // build a list of drop down choices for this selection
    let items = [];

    items.push(available);

    for (let i = 0; i < buddies.length; i++) {
      var buddy = buddies[i];

      if (validBuddy(buddy, player, players)) {
        items.push(buddy);
      }
    }

    return items;
  }

  render() {
    console.log("PlayerPicker: render");
    console.log("players: " + JSON.stringify(this.state.players));

    const players = this.state.players;
    const buddies = Buddies.get();
    const searchResults = this.filterSearchResults(this.state.searchResults); 
    const getChoices = this.getChoices;
    const handleSelectionChanged = this.handleSelectionChanged;
    const handleSearchResults = this.handleSearchResults;

    let foursome = [];

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
                      choices={getChoices(player, players, buddies)}
                      searchResults={searchResults}
                      onChange={handleSelectionChanged}
                      onSearchResults={handleSearchResults}>
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
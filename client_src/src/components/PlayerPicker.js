import React, {Component} from 'react';
import {Table} from 'react-materialize';
import '../App.css';
import Player from './Player';
import Buddies from '../utils/Buddies';

let isSameId = function( id1, id2) {
  return (id1.toString() === id2.toString());
}

let isSamePlayer = function( player1, player2) {
  return (isSameId(player1.id, player2.id));
}

let validBuddy = function (buddy, player, foursome) {
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
let isBuddy = function (player, owner, buddies) {
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

let isInFoursome = function (player, owner, foursome) {
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

let available = {
  name: "Available",
  id: "0000"
};


class PlayerPicker extends Component {

  constructor(props) {
    super(props);

    this.state = {
      owner: props.owner, // owner of this tee time is always the first player

      players: [
      ]
    };

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

      this.handleSearchChanged = this
      .handleSearchChanged
      .bind(this);

      this.handleSearchFilter = this
      .handleSearchFilter
      .bind(this);

  }

  findPlayer(id) {
    const buddies = Buddies.get();

    console.log("findPlayer: buddies " + JSON.stringify(buddies));

    for (let i = 0; i < buddies.length; i++) {
      const buddy = buddies[i];

      if (isSameId(buddy.id, id)) {
        return buddy;
      }
    }

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

        console.log("players: " + JSON.stringify(players));

        this.stateChange({players: players});
      }
    }
  }

  handleSearchChanged(result) {
    console.log("handleSearchChanged : " + JSON.stringify(result));

    const buddies = Buddies.get();
    const players = this.state.players;
    const owner = this.state.owner;

    // search result could mean that a totally new player is added to the list.
    // look for that here, add it to our "buddies" list if so
    if (!isBuddy(result, owner, buddies)) {
      Buddies.add(result);
    }

    // if the searched for player isn't in the foursome, add them
    //
    if (!isInFoursome(result, owner, players)) {
      players.push(result);
    }

    this.stateChange({players: players});
  }

  /**
   * this hook gives us a chance to modify the results of the search.  we use this opportunity
   * to take out invalid choices, e.g. people already in our foursome.
   * 
   * @param {Array} results list of players resulting from the search
   */
  handleSearchFilter(results) {
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

    console.log("handleSearchFilter returning: " + JSON.stringify(filteredResults));
    return filteredResults;
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
    const getChoices = this.getChoices;
    const handleSelectionChanged = this.handleSelectionChanged;
    const handleSearchChanged = this.handleSearchChanged;
    const handleSearchFilter = this.handleSearchFilter;

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
                      onChange={handleSelectionChanged}
                      onChangeSearch={handleSearchChanged}
                      onFilterSearch={handleSearchFilter}>
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
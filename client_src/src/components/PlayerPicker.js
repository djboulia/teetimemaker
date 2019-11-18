import React, {Component} from 'react';
import {Table} from 'react-materialize';
import '../App.css';
import Player from './Player';

let validBuddy = function (buddy, player, foursome) {
  if (buddy.id.toString() === player.id.toString()) {
    // always include the active player in the list
    return true;
  }

  // look at other players already in the foursome and take those out of the
  // buddies choices

  for (let i = 0; i < foursome.length; i++) {
    const currentPlayer = foursome[i];

    if (buddy.id.toString() === currentPlayer.id.toString()) {
      return false;
    }

  }

  return true;
}

// return true if the buddy exists in our list, false otherwise
let isBuddy = function (player, buddies) {
  let found = false;

  for (let i = 0; i < buddies.length; i++) {
    const buddy = buddies[i];

    if (buddy.id.toString() === player.id.toString()) {
      found = true;
      break;
    }
  }

  return found;
}

let isInFoursome = function (player, foursome) {
  let found = false;

  for (let i = 0; i < foursome.length; i++) {
    const golfer = foursome[i];

    if (golfer.id.toString() === player.id.toString()) {
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
      ],

      buddies: [
      ]
    };

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

    this.handleSearchChanged = this
      .handleSearchChanged
      .bind(this);

  }

  findPlayer(id) {
    console.log("findPlayer: buddies " + JSON.stringify(this.state.buddies));

    for (let i = 0; i < this.state.buddies.length; i++) {
      const buddy = this.state.buddies[i];

      if (buddy.id.toString() === id.toString()) {
        return buddy;
      }
    }

    return available;
  }

  /**
   * funnel all state changes through this method so that 
   * we fire an appropriate onChange event when state changes
   * 
   * @param {*} state new state to set
   */
  stateChange(state) {
    this.setState(state, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.players);
      }
    });
  }

  handleSearchChanged(result) {
    console.log("handleSearchChanged : " + JSON.stringify(result));

    let buddies = this.state.buddies;
    let players = this.state.players;

    // search result could mean that a totally new player is added to the list look
    // for that here, add it to our "buddies" list if so
    if (!isBuddy(result, buddies)) {
      buddies.push(result);
    }

    // if the searched for player isn't in the foursome, add them
    //
    if (!isInFoursome(result, players)) {
      players.push(result);
    }

    this.stateChange({buddies: buddies, players: players});

  }

  handleSelectionChanged(e) {
    console.log("event : " + JSON.stringify(e.target.id));
    console.log("changed! " + e.target.value);

    const prefix = "Player_";

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
          if (player.name !== "Available") {
            players.push(player);
          }
        } else {
          if (player.name === "Available") {
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
    const buddies = this.state.buddies;
    const getChoices = this.getChoices;
    const handleSelectionChanged = this.handleSelectionChanged;
    const handleSearchChanged = this.handleSearchChanged;

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
                <Player name={this.state.owner} self="true"></Player>
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
                      defaultValue={player}
                      choices={getChoices(player, players, buddies)}
                      onChange={handleSelectionChanged}
                      onChangeSearch={handleSearchChanged}></Player>
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
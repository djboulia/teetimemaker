import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Player from './Player';
import PlayerUtils from '../../utils/PlayerUtils';
import Buddies from '../../utils/Buddies';
import PlayerSearch from '../../utils/PlayerSearch';

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

const findPlayer = function (id, buddies, searchResults) {
  console.log("findPlayer: buddies " + JSON.stringify(buddies));

  let player = PlayerUtils.findById(buddies, id);
  if (player) {
    return player;
  }

  // if we didn't find them in our buddy list, look in search
  // results
  player = PlayerUtils.findById(searchResults, id);
  if (player) {
    return player;
  }

  console.log("Warning! id " + id + " not found!");
  return PlayerUtils.getEmptyPlaceHolder();
}

const buildFoursome = function (players) {
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

  return foursome;
}

export default function PlayerPicker(props) {
  const [players, setPlayers] = React.useState([]);
  const [searchResults, setSearchResults] = React.useState([]);
  const [searching, setSearching] = React.useState(undefined);

  /**
   * look for players already in our foursome and remove them from the search results
   * 
   * @param {Array} results list of players resulting from the search
   */
  const filterResults = function (results) {
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

  const owner = props.owner;
  const filteredSearchResults = filterResults(searchResults);
  const searchInProgress = (searching) ? true : false;
  const foursome = buildFoursome(players);

  /**
   * fire change events when player list changes
   */
  React.useEffect(() => {
    console.log("PlayerPicker.useEffect: ", players);
    if (props.onChange) {
      props.onChange(players);
    }
  }, [players])

  const handleSelectionChanged = function (e) {
    console.log("handleSelectionChanged event : " + JSON.stringify(e.target));
    console.log("changed! " + e.target.value);

    const buddies = Buddies.get();
    const prefix = "Player_";
    const newPlayers = [];

    // copy any existing players first
    for (let i = 0; i < players.length; i++) {
      newPlayers.push(players[i]);
    }

    console.log("self:" + JSON.stringify(owner));

    if (e.target.id.startsWith(prefix)) {
      let id = e
        .target
        .id
        .substring(prefix.length);

      if (id >= 0 || id < 3) {
        console.log(JSON.stringify(newPlayers));

        let player = findPlayer(e.target.value, buddies, searchResults);
        console.log("found player: " + JSON.stringify(player));

        if (id >= newPlayers.length) {
          // add it to the end
          if (!PlayerUtils.isEmpty(player) && !PlayerUtils.isSamePlayer(player, owner)) {
            newPlayers.push(player);
          }
        } else {
          if (PlayerUtils.isEmpty(player) || PlayerUtils.isSamePlayer(player, owner)) {
            // remove the entry
            newPlayers.splice(id, 1);
          } else {
            // replace the entry
            newPlayers[id] = player;
          }
        }

        // could be a totally new player added to the list.
        // look for that here, add it to our "buddies" list if so

        if (!PlayerUtils.isEmpty(player) && !isBuddy(player, owner, buddies)) {
          console.log("adding buddy : " + JSON.stringify(player));
          Buddies.add(player);
        }

        console.log("players: " + JSON.stringify(newPlayers));

        setPlayers(newPlayers);
      }
    }
  }

  const searchComplete = function (results) {
    // set the search results and stop searching
    console.log("search complete: ", results);

    setSearchResults(results);
    setSearching(undefined);
  }

  /**
   * called whenever a new search is executed. 
   * 
   * @param {Array} searchtext names to search for
   */
  const handleSearch = function (searchtext) {
    if (searching) {  // cancel in progress search before doing a new one
      searching.cancel();
    }

    const newSearch = new PlayerSearch(searchtext);
    newSearch.doSearch(searchComplete);

    setSearchResults([]);
    setSearching(newSearch);
  }

  const getChoices = function (playerChoice) {
    // build a list of drop down choices for this selection
    const buddies = Buddies.get();
    const available = PlayerUtils.getEmptyPlaceHolder();

    const items = [];
    items.push(available);  // first choice is always the available slot

    if (!PlayerUtils.isEmpty(playerChoice)) { // if this is a valid player, add it to the list
      items.push(playerChoice);
    }

    const buddylist = filterResults(buddies);
    return items.concat(buddylist);
  }

  console.log("PlayerPicker: render");
  console.log("players: " + JSON.stringify(players));

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          <TableCell>Players</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        <TableRow>
          <TableCell>1</TableCell>
          <TableCell><Player value={owner} self="true"></Player></TableCell>
        </TableRow>

        {foursome
          .map(function (player, index) {

            return (
              <TableRow key={index}>
                <TableCell>
                  {index + 2}
                </TableCell>

                <TableCell>
                  <Player
                    id={"Player_" + index}
                    value={player}
                    choices={getChoices(player)}
                    searchResults={filteredSearchResults}
                    searchInProgress={searchInProgress}
                    onChange={handleSelectionChanged}
                    onSearch={handleSearch}>
                  </Player>
                </TableCell>

              </TableRow>
            );

          })}

      </TableBody>

    </Table>
  )
}

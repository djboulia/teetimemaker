/**
 * Encapsulate a list of prior golfers 
 */

/**
 * internal function to compare the ids
 * 
 * @param {String} id1 
 * @param {String} id2 
 */
const isSameId = function (id1, id2) {
  return (id1 === id2);
};

const playerIdMatches = function (player, username) {
  return isSameId(player.username, username);
};


const PlayerUtils = {

  findById: function (list, id) {
    for (let i = 0; i < list.length; i++) {
      const item = list[i];

      if (playerIdMatches(item, id)) {
        return item;
      }
    }

    return undefined;
  },

  isSamePlayer: function (player1, player2) {
    return (isSameId(player1.username, player2.username));
  },

  /**
   * return a dummy player that shows "available" as the name
   * allows us to load up a foursome in the UI with empty player slots
   */
  getEmptyPlaceHolder: function () {
    return {
      name: "Available",
      username: "----"
    };
  },

  isEmpty: function (player) {
    return this.isSamePlayer(player, this.getEmptyPlaceHolder());
  }

};

export default PlayerUtils;
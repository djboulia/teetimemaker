/**
 * Encapsulate a list of prior golfers 
 */
import Server from './Server';

let getUserName = function() {
  const user = Server.getUser();
  return user.name;
}
const LocalStorage = {
  getStorageKey() {
    return getUserName() + "_buddies_v2";
  },

  /**
   * remove any existing session data
   */
  reset() {
    console.log("session cleared");
    localStorage.removeItem(this.getStorageKey());
  },

  /**
   * set the data at this key
   * 
   * @param {Object} data the data to set at this key
   */
  set(data) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  },

  /**
   * get the data at this key
   * 
   */
  get() {
    const str = localStorage.getItem(this.getStorageKey());

    if (str) {
      const data = JSON.parse(str);
      
      return data;
    }

    return undefined;
  }
};

const Buddies = {

  /**
   * return the current array of buddies
   */
  get() {
    let buddies = LocalStorage.get();

    return (buddies === undefined) ? [] : buddies;
  },

  /**
   * add a new buddy
   *
   * @param {Object} player the buddy to add
   */
  add(player) {

    const buddies = this.get();
    
    buddies.push(player);

    LocalStorage.set(buddies);
  }

};

export default Buddies;
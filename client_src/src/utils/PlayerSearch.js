import Server from './Server';

class PlayerSearch {
    constructor(text) {
      this.text = text;
      this.cb = null;
    }
  
    cancel() {
      // cancel any current callback
      this.cb = null;
      console.log("player search canceled");
    }
  
    doSearch(cb) {
  
      const self = this;
      self.cb = cb;
  
      Server.memberSearch(self.text)
        .then((results) => {        
          // callback could've been canceled or not supplied so check that first
          if (self.cb) {
            self.cb(results);
          }
        })
        .catch((e) => {
          console.log("error on search: " + JSON.stringify(e));
        })
  
        return true;
    }
  }
  
  export default PlayerSearch;
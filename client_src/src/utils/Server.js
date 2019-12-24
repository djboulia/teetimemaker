import axios from 'axios';

const UrlHandler = {

  /**
   * if REACT_APP_URL is set, we send back end requests to that, otherwise
   * we default to the same host that served up the client
   * useful for dev mode where the server might be hosted in a different url
   */
  baseUrl() {
    // console.log("baseUrl: " + process.env.REACT_APP_URL);

    return (process.env.REACT_APP_URL) ? process.env.REACT_APP_URL : "/api/";
  },

  getUrl(page) {
    return this.baseUrl() + page;
  },

  getUrlWithToken(page, token) {
    return this.baseUrl() + page + "?access_token=" + token;
  }
};


const Session = {
  storageKey: "session",

  /**
   * remove any existing session data
   */
  reset() {
    console.log("session cleared");
    localStorage.removeItem(this.storageKey);
  },

  /**
   * set up a new session
   * 
   * @param {String} name human readable name for this user
   * @param {Number} id golfer id for this user on the PWCC site
   * @param {String} token session token
   * @param {Integer} ttl time to live in millisecs
   */
  set(name, id, token, ttl) {
    const data = {
      name: name,
      id: id,
      token: token,
      expires: new Date().getTime() + ttl,
      ttl: ttl
    }

    localStorage.setItem(this.storageKey, JSON.stringify(data));
    console.log(`token ${token} set`);
  },

  getSessionData() {
    const str = localStorage.getItem(this.storageKey);

    if (str) {
      const data = JSON.parse(str);

      if (data && data.expires) {
        // check to see if it's expired
        const now = new Date().getTime();
        console.log(`expires ${data.expires} and now ${now}`);

        if (now >= data.expires) {
          // expired, remove the session from storage and return undefined
          console.log("token expired, clearing session");
          this.reset();
        } else {
          // valid session, return it
          return data;
        }
      }
    }

    return undefined;
  },

  /**
   * look for a previously stored token in our local storage
   * if we have a valid login, there will be a key there
   * if the key hasn't expired, return the token
   */
  getToken() {
    let token = undefined;
    const data = this.getSessionData();

    if (data) {
      token = data.token;
    }

    console.log("returning token " + token);
    return token;
  },

  getUser() {
    let user = {
      name: undefined,
      id: undefined
    };
    const data = this.getSessionData();

    if (data) {
      user.name = data.name;
      user.id = data.id;
    }

    console.log("returning user " + JSON.stringify(user));
    return user;
  }
};

const Server = {
  isLoggedIn() {
    return Session.getToken() !== undefined;
  },

  login(username, password) {

    const result = {
      status: false,
      msg: ""
    };

    // new login, remove any existing token
    Session.reset();

    return new Promise((resolve, reject) => {
      return axios.post(UrlHandler.getUrl(`Members/login`), {
        username: username,
        password: password
      }).then(res => {
        console.log(res);
        console.log(res.data);

        const userData = res.data.user;
        const name = (userData && userData.data) ? userData.data.name : undefined;
        const id = (userData && userData.data) ? userData.data.id : undefined;
        const token = res.data.id;

        Session.set(name, id, token, res.data.ttl);

        result.status = true;
        result.msg = "Successfully Logged in";

        resolve(result);
      }).catch((e) => {
        console.log("error: " + JSON.stringify(e.response));

        result.status = false;
        result.msg = (e.response && e.response.data && e.response.data.error && e.response.data.error.message) ?
          e.response.data.error.message :
          "Error logging in.";

        resolve(result);
      })
    })
  },

  logout() {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios
        .post(UrlHandler.getUrlWithToken(`Members/logout`, Session.getToken()))
        .then(res => {
          console.log(res);
          console.log(res.data);

          Session.reset();

          resolve('success');
        })
        .catch((e) => {
          reject(e);
        })
    })
  },

  getUser() {
    return Session.getUser();
  },

  memberSearch(name) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios.post(UrlHandler.getUrlWithToken(`Members/search`, Session.getToken()), {
          lastname: name
        }).then(res => {
          console.log(res);
          console.log(res.data);

          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        })
    })
  },

  schedulerList() {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios
        .get(UrlHandler.getUrlWithToken(`Scheduler`, Session.getToken()))
        .then(res => {
          console.log(res);
          console.log(res.data);

          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        })
    })

  },

  schedulerGet(id) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios
        .get(UrlHandler.getUrlWithToken(`Scheduler/${id}`, Session.getToken()))
        .then(res => {
          console.log(res);
          console.log(res.data);

          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        })
    })

  },

  schedulerAdd(time, courses, golfers) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios.post(UrlHandler.getUrlWithToken(`Scheduler`, Session.getToken()), {
          time: time,
          courses: courses,
          golfers: golfers
        }).then(res => {
          console.log(res);
          console.log(res.data);

          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        })
    })

  },

  schedulerDelete(id) {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios
        .delete(UrlHandler.getUrlWithToken(`Scheduler/${id}`, Session.getToken()))
        .then(res => {
          console.log(res);
          console.log(res.data);

          resolve(res.data);
        })
        .catch((e) => {
          reject(e);
        })
    })

  }

};

export default Server;
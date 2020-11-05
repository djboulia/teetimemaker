import axios from 'axios';

import Session from './Session';

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

const Server = {
  isLoggedIn() {
    return Session.getToken() !== undefined;
  },

  login(userid, password) {

    const result = {
      status: false,
      msg: ""
    };

    // new login, remove any existing token
    Session.reset();

    return new Promise((resolve, reject) => {
      return axios.post(UrlHandler.getUrl(`Members/login`), {
        username: userid,
        password: password
      }).then(res => {
        console.log(res);
        console.log(res.data);

        const userData = res.data.user;
        const name = (userData && userData.data) ? userData.data.name : undefined;
        const username = (userData && userData.data) ? userData.data.id : undefined;  // ForeTees username is the id
        const token = res.data.id;

        Session.create(name, username, token, res.data.ttl);

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

  },

  schedulerHistory() {
    const self = this;

    return new Promise((resolve, reject) => {
      if (!self.isLoggedIn()) {
        const str = "Not logged in, log in first";
        console.log(str);
        reject(str);
        return;
      }

      axios
        .get(UrlHandler.getUrlWithToken(`Scheduler/history`, Session.getToken()))
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
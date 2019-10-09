/**
 *  TODO: add passing of token info after login
 * 
 * wrapper for the tee time service. This runs as a separate REST service
 * the service does the actual booking on the golf club web site
 */
var JsonRequest = require('../jsonrequest.js');
var MockJsonRequest = require('../mockjsonrequest.js');

const BASE_URL = "https://teetimepwccjs.mybluemix.net/api/";
// **testing** const BASE_URL = "http://localhost:3000/api/";
const MEMBER_BASE_URL = BASE_URL + "Members/"
const TEETIME_BASE_URL = BASE_URL + "TeeTimes/";

var getTestMode = function () {
  var app = require('../../../server/server');

  var mockTeeTimes = app.get('mockTeeTimes');
  if (mockTeeTimes) {
    console.log("test mode: tee time calls will NOT actually book a tee time");
  }

  return mockTeeTimes;
};

var parseDate = function (timedate) {
  // break up the date into from a combined time and date string 
  const timeParts = timedate.split(' ');

  const date = timeParts[2];

  return date;
}

var parseTime = function (timedate) {
  // break up the time into from a combined time and date string 
  const timeParts = timedate.split(' ');

  const time = timeParts[0] + ' ' + timeParts[1];

  return time;
}

/**
 * the search and reserve functions expect the following input:
 * 
 * teetimedata consists of:
 * {
 *  "time": the time and date of the tee time, e.g. 8:30 AM 8/8/2018
 *  "courses": an array of courses in order of preference: Highlands, Meadows, Fairways
 *  "golfers": an array of golfers to include in this tee time
 *            a minimum of 1 golfer is required (the user booking the tee time)
 *            a maximum of 4 golfers allowed
 * 
 *  each golfer consists of the following structure:
 *    {
 *        id: the id of this golfer in the system (confusingly, this is NOT the userid)
 *        name: the name of this golfer in the system
 *    }
 * 
 *   a golfer's id and name can be retrieved via the memberSearch function
 * };
 */
var teeTimeArgs = function (timedate, courses, players) {
  const teetimedata = {
    time: parseTime(timedate),
    date: parseDate(timedate),
    courses: courses
  }

  if (players != undefined) {
    teetimedata.players = players;
  }

  return teetimedata;
};

var TeeTimeAPI = function () {

  var testMode = getTestMode();
  var loggedIn = false;
  var tokenId = undefined;

  const MEMBER_LOGIN_URL = MEMBER_BASE_URL + "login";
  const MEMBER_LOGOUT_URL = MEMBER_BASE_URL + "logout";
  const MEMBER_INFO_URL = MEMBER_BASE_URL + "info";
  const MEMBER_SEARCH_URL = MEMBER_BASE_URL + "search";

  const TEETIME_SEARCH_URL = TEETIME_BASE_URL + "search";
  const TEETIME_RESERVE_URL = TEETIME_BASE_URL + "reserve";

  this.buildTokenizedUrl = function(url) {
    const tokenUrl = url + "?access_token=" + tokenId;

    return tokenUrl;
  };

  this.login = function (username, password) {
    return new Promise(function (resolve, reject) {
      console.log("member login fired at " + new Date().toString());

      var request = new JsonRequest(MEMBER_LOGIN_URL);

      var json = {
        username: username,
        password: password
      };

      request.post(json, function (json) {
        if (json) {
          console.log(JSON.stringify(json));

          tokenId = json.id;
          loggedIn = true;

          resolve(json);
        } else {
          var str = "Error during login!";
          console.log(str);
          reject(str);
        }
      });
    });

  };

  this.logout = function () {
    const self = this;

    return new Promise(function (resolve, reject) {
      console.log("member logout fired at " + new Date().toString());

      if (!loggedIn) {
        reject("Not logged in!");
        return;
      }

      var url = self.buildTokenizedUrl(MEMBER_LOGOUT_URL)
      var request = new JsonRequest(url);

      var json = {};

      request.post(json, function (json) {
        if (json) {
          console.log(JSON.stringify(json));

          tokenId = undefined;
          loggedIn = false;

          resolve(json);
        } else {
          var str = "Error during logout!";
          console.log(str);
          reject(str);
        }
      });
    });

  };

  this.memberInfo = function () {
    const self = this;

    return new Promise(function (resolve, reject) {
      console.log("member info fired at " + new Date().toString());

      if (!loggedIn) {
        reject("Not logged in!");
        return;
      }

      var url = self.buildTokenizedUrl(MEMBER_INFO_URL)
      var request = new JsonRequest(url);
      var json = {};

      request.post(json, function (json) {
        if (json) {
          console.log(JSON.stringify(json));
          resolve(json);
        } else {
          var str = "Error getting member info!";
          console.log(str);
          reject(str);
        }
      });
    });

  };

  this.memberSearch = function (lastName) {
    const self = this;

    return new Promise(function (resolve, reject) {
      console.log("member search fired at " + new Date().toString());

      if (!loggedIn) {
        reject("Not logged in!");
        return;
      }

      var url = self.buildTokenizedUrl(MEMBER_SEARCH_URL)
      var request = new JsonRequest(url);

      var json = {
        lastname: lastName
      };

      request.post(json, function (json) {
        if (json) {
          console.log(JSON.stringify(json));
          resolve(json);
        } else {
          var str = "Error searching for member " + lastName + "!";
          console.log(str);
          reject(str);
        }
      });
    });
  };

  this.validCourses = function (courses) {
    if (courses.length == 0 || courses.length > 3) {
      return false;
    }

    for (var i = 0; i < courses.length; i++) {
      var course = courses[i];

      switch (course.toLowerCase()) {
        case 'highlands':
        case 'meadows':
        case 'fairways':
          break; // these are all valid

        default:
          return false;
      }
    }

    return true;
  };

  this.validGolfers = function (golfers) {
    if (golfers.length > 3) {
      return false;
    }

    return true;
  };

  /**
   * search for a tee time with the backend reservation system
   * see teetimedata above for structure of the input
   */
  this.search = function (timedate, courses) {
    const self = this;

    console.log("search fired at " + new Date().toString());

    const teetimedata = teeTimeArgs(timedate, courses);
    console.log("teetimedata " + JSON.stringify(teetimedata));

    return new Promise(function (resolve, reject) {
      if (!loggedIn) {
        reject("Not logged in!");
        return;
      }

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
        return;
      }

      var url = self.buildTokenizedUrl(TEETIME_SEARCH_URL)
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      request.post(teetimedata, function (json) {
        if (json) {
          console.log(JSON.stringify(json));
          resolve(json);
        } else {
          var str = "Error searching for tee times!";
          console.log(str);
          reject(str);
        }
      });
    });
  };

  /**
   * book at tee time with the backend reservation system
   * see teetimedata above for structure of the input
   */
  this.reserve = function (timedate, courses, players) {
    const self = this;

    console.log("reserve fired at " + new Date().toString());

    const teetimedata = teeTimeArgs(timedate, courses, players);
    console.log("teetimedata " + JSON.stringify(teetimedata));

    return new Promise(function (resolve, reject) {

      if (!loggedIn) {
        reject("Not logged in!");
        return;
      }

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
        return;
      }

      if (!self.validGolfers(teetimedata.players)) {
        reject("invalid golfers array in input : " + JSON.stringify(teetimedata));
        return;
      }

      var url = self.buildTokenizedUrl(TEETIME_RESERVE_URL)
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      request.post(teetimedata, function (json) {
        if (json) {
          if (json.time) {
            console.log(JSON.stringify(json));
            resolve(json);
          } else {
            // didn't return a tee time, some error occurred
            console.log("Error: " + JSON.stringify(json));
            reject(json);
          }
        } else {
          var str = "Error reserving tee time!";
          console.log(str);
          reject(str);
        }
      });
    });

  };

};

module.exports = TeeTimeAPI;
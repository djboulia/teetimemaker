//
// wrapper for the tee time service. This runs as a separate REST service
// the service does the actual booking on the golf club web site
//
var JsonRequest = require('../jsonrequest.js');
var MockJsonRequest = require('../mockjsonrequest.js');

var BASE_URL = "https://teetimepwccjs.mybluemix.net/api/teetimes/";

var getTestMode = function () {
  var app = require('../../../server/server');

  var mockTeeTimes = app.get('mockTeeTimes');
  if (mockTeeTimes) {
    console.log("test mode: tee time calls will NOT actually book a tee time");
  }

  return mockTeeTimes;
};

//
// these functions take the following input:
//  
// teetimedata consists of:
//  {
//   "userid": userid for the back end reservation system
//   "password": password for the back end reservation system
//   "time": the time and date of the tee time, e.g. 8:30 AM 8/8/2018
//   "courses": an array of courses in order of preference: Highlands, Meadows, Fairways
//   "golfers": an array of golfers to include in this tee time
//              a minimum of 1 golfer is required (the user booking the tee time)
//              a maximum of 4 golfers allowed
//
//   each golfer consists of the following structure:
//      {
//        id: the id of this golfer in the system (confusingly, this is NOT the userid)
//        name: the name of this golfer in the system
//      }
//
//  a golfer's id and name can be retrieved via the memberapi.search function
// };
//

var TeeTimeAPI = function () {

  var testMode = getTestMode();

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

  //
  // search for a tee time with the backend reservation system
  // see teetimedata above for structure of the input
  //
  this.search = function (username, password, timedate, courses) {
    console.log("search fired at " + new Date().toString());

    const teetimedata = {
      username : username,
      password : password,
      time : parseTime(timedate),
      date : parseDate(timedate),
      courses : courses
    }

    console.log("teetimedata " + JSON.stringify(teetimedata));

    var self = this;

    return new Promise(function (resolve, reject) {
      var url = BASE_URL + "search";
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
      }

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

  //
  // book at tee time with the backend reservation system
  // see teetimedata above for structure of the input
  //
  this.reserve = function (username, password, timedate, courses, players) {
    console.log("reserve fired at " + new Date().toString());

    const teetimedata = {
      username : username,
      password : password,
      time : parseTime(timedate),
      date : parseDate(timedate),
      courses : courses,
      players : players
    }

    console.log("teetimedata " + JSON.stringify(teetimedata));

    var self = this;

    return new Promise(function (resolve, reject) {

      var url = BASE_URL + "reserve";
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
        return;
      }

      if (!self.validGolfers(teetimedata.players)) {
        reject("invalid golfers array in input : " + JSON.stringify(teetimedata));
        return;
      }

      request.post(teetimedata, function (json) {
        if (json) {
          if (json.time) {
            console.log(JSON.stringify(json));
            resolve(json);
          } else {
            // didn't return a tee time, some error occured
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
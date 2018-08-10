//
// wrapper for the tee time service. This runs as a separate REST service
// the service does the actual booking on the golf club web site
//
var JsonRequest = require('../../common/lib/jsonrequest.js');
var MockJsonRequest = require('../../common/lib/mockjsonrequest.js');

var BASE_URL = "https://teetime-pwcc.mybluemix.net/teetimepwcc/v1/teetime/";

var getTestMode = function () {
  var app = require('../../server/server');

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

var TeeTimeService = function () {

  var testMode = getTestMode();

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
    if (golfers.length == 0 || golfers.length > 4) {
      return false;
    }

    return true;
  };

  //
  // search for a tee time with the backend reservation system
  // see teetimedata above for structure of the input
  //
  this.search = function (teetimedata) {
    console.log("search fired at " + new Date().toString());

    var self = this;

    return new Promise(function (resolve, reject) {
      var url = BASE_URL + "search";
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
      }

      if (!self.validGolfers(teetimedata.golfers)) {
        reject("invalid golfers array in input : " + JSON.stringify(teetimedata));
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
  this.reserve = function (teetimedata) {
    console.log("reserve fired at " + new Date().toString());
    // console.log("teetimedata " + JSON.stringify(teetimedata));

    var self = this;

    return new Promise(function (resolve, reject) {

      var url = BASE_URL + "reserve";
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      if (!self.validCourses(teetimedata.courses)) {
        reject("invalid course list in input : " + JSON.stringify(teetimedata));
      }

      if (!self.validGolfers(teetimedata.golfers)) {
        reject("invalid golfers array in input : " + JSON.stringify(teetimedata));
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

module.exports = TeeTimeService;
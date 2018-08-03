//
// wrapper for the tee time service. This runs as a separate REST service
// the service does the actual booking on the golf club web site
//
var JsonRequest = require('../../common/lib/jsonrequest.js');
var MockJsonRequest = require('../../common/lib/mockjsonrequest.js');

var BASE_URL = "https://teetime-pwcc.mybluemix.net/teetimepwcc/v1/teetime/";

var getTestMode = function() {
  var app = require('../../server/server');

  var mockTeeTimes = app.get('mockTeeTimes');
  if (mockTeeTimes) {
    console.log("test mode: tee time calls will NOT actually book a tee time");
  }

  return mockTeeTimes;
};

var TeeTimeAPI = function () {

  var testMode = getTestMode();

  var searchUrl = BASE_URL + "search";
  var reserveUrl = BASE_URL + "reserve";

  this.search = function (teetime) {
    console.log("search fired at " + new Date().toString());

    return new Promise(function (resolve, reject) {
      var url = searchUrl;
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      request.post(teetime.json(), function (json) {
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

  this.reserve = function (teetime) {
    console.log("reserve fired at " + new Date().toString());

    return new Promise(function (resolve, reject) {

      var url = reserveUrl;
      var request = testMode ? new MockJsonRequest(url) : new JsonRequest(url);

      request.post(teetime.json(), function (json) {
        if (json) {
          console.log(JSON.stringify(json));
          resolve(json);
        } else {
          var str = "Error reserving tee times!";
          console.log(str);
          reject(str);
        }
      });
    });


  };

};


module.exports = TeeTimeAPI;
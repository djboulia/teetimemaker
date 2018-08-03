// 
// fake up HTTP calls for testing purposes. This avoids hitting the 
// back end reservation system and allows us to test the rest of the
// logic without actually booking a tee time.
//
var request = require('request');

var TEETIME_URL = "https://teetime-pwcc.mybluemix.net/teetimepwcc/v1/teetime/";

var mockRequest = function (url, data, cb) {
  process.nextTick(function () {
    var search = TEETIME_URL + 'search';
    var reserve = TEETIME_URL + 'reserve';

    var json = {};

    if (url == search) {
      // fake up a reserve result
      console.log("MOCK SEARCH call to " + url);

      json = [
        "Thu Aug 02 14:00:00 UTC 2018 78539892 Meadows [Alex Huml|Anthony Greco|Available|Available]",
        "Thu Aug 02 14:00:00 UTC 2018 81156352 Highlands [Available|Available|Available|Available]",
        "Thu Aug 02 14:10:00 UTC 2018 78539893 Meadows [Available|Available|Available|Available]"
      ];

    } else if (url == reserve) {
      // fake up a reserve result
      console.log("MOCK RESERVE call to " + url);

      json.time = data ? data.time : "";
      json.course = data.courses ? data.courses[0] : "";
    } else {
      console.log("MOCK UNKNOWN call to " + url);
    }

    cb(json);
  });
};

var MockJsonRequest = function (url) {

  this.get = function (cb) {

    mockRequest(url, null, (json) => {
      cb(json);
    });
  }

  this.post = function (data, cb) {

    mockRequest(url, data, (json) => {
      cb(json);
    });

  }

};

module.exports = MockJsonRequest;
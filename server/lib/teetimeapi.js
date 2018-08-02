//
// wrapper for the tee time service. This runs as a separate REST service
// the service does the actual booking on the golf club web site
//
var JsonRequest = require('../../common/lib/jsonrequest.js');

var BASE_URL = "https://teetime-pwcc.mybluemix.net/teetimepwcc/v1/teetime/";

var TeeTimeAPI = function () {

  var searchUrl = BASE_URL + "search";
  var reserveUrl = BASE_URL + "reserve";

  this.search = function (reservation) {
    console.log("search fired at " + new Date().toString());

    return new Promise(function (resolve, reject) {
      var url = searchUrl;
      var request = new JsonRequest(url);

      request.post(reservation.json(), function (json) {
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

  this.reserve = function (reservation) {
    console.log("reserve fired at " + new Date().toString());

    return new Promise(function (resolve, reject) {

      var url = reserveUrl;
      var request = new JsonRequest(url);

      request.post(reservation.json(), function (json) {
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
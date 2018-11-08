//
// wrapper for the tee time service. This runs as a separate REST service
// the service does the actual booking on the golf club web site
//
var JsonRequest = require('../jsonrequest.js');

var BASE_URL = "https://teetimepwccjs.mybluemix.net/api/members/";

var MemberAPI = function () {

  var memberInfoUrl = BASE_URL + "info";
  var memberSearchUrl = BASE_URL + "search";

  this.info = function (userid, password) {
    return new Promise(function (resolve, reject) {
      console.log("member info fired at " + new Date().toString());

      var url = memberInfoUrl;
      var request = new JsonRequest(url);

      var json = {
        username: userid,
        password: password
      };

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

  this.search = function (userid, password, lastName) {
    return new Promise(function (resolve, reject) {
      console.log("member search fired at " + new Date().toString());

      var url = memberSearchUrl;
      var request = new JsonRequest(url);

      var json = {
        username: userid,
        password: password,
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



};


module.exports = MemberAPI;
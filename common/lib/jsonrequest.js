/**
 * wrap a basic REST request over HTTP and format in/out values in JSON
 */
var request = require('request');

var JsonRequest = function (url) {

  this.get = function (cb) {
    request.get(url, (error, response, body) => {

      var json = null;

      if (!error) {

        json = JSON.parse(body);

      } else {
        console.log("Error!: " + error);
      }

      cb(json);

    });
  }

  this.post = function (data, cb) {
    var options = {
      uri: url,
      method: 'POST',
      json: data
    };

    request(options, (error, response, body) => {

      var json = null;

      if (!error) {
        // the body comes back pre-parsed as a JSON object
        // so just assign it directly here
        json = body;
      } else {
        console.log("Error!: " + error);
      }

      cb(json);

    });
  }

};

module.exports = JsonRequest;
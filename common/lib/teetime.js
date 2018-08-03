//
// this represents the specifics of the reservation, tee time, course 
// preferences, other players in the foursome. It also knows the rules
// for when the tee sheet opens, 3 days before the booked tee time.
// 
var moment = require('moment-timezone');

var TeeTime = function(userid, password, time, courses, golfers) {

  // all tee times come in as an Eastern time zone.  use moment-timezone
  // to parse the time appropriately regardless of the timezone of the
  // environment we're running in
  var etzMoment = moment.tz(time, "h:mm A MM/DD/YYYY", 'America/New_York');

  this.getDate = function() {
    // console.log("etzMoment: " + etzMoment.format());
    return new Date(etzMoment.clone().utc().format());
  };

  // calculate the first time we can actually book this tee
  // time.  the tee sheet opens at 7am three days before
  this.getTeeSheetOpenTime = function() {
    // console.log("etzMoment: " + etzMoment.format());

    // move to the beginning of the day of the reservation
    var m = etzMoment.clone().startOf("day");
    var date = new Date(m.utc().format());

    // console.log("getTeeSheetOpenTime: " + date.toString());

    // move back 3 days, then forward to 2 minutes before 7am
    // the tee sheet opens at 7am Eastern, but we cheat by 2 minutes to make
    // sure we get in before anyone else (i.e. 6:58 AM 3 days before)
    return new Date(date.getTime()  - (3 * 24 * 60 * 60 * 1000) // back 3 days
                                    + (7 * 60 * 60 * 1000) // forward to 7am
                                    - (2 * 60 * 1000)); // back 2 minutes

  };

  //
  // return a JSON object which is useful for sending to the tee time API
  //
  this.json = function() {
    return {
      "userid" : userid,
      "password" : password,
      "time" : time,
      "courses" : courses,
      "golfers" : golfers
    };
  }

  //
  // return a string representation of the object with password masked
  //
  this.toString = function() {
    var json = this.json();
    var passwordMask = "###################################";

    json.password = passwordMask.substr(0, json.password.length);

    return JSON.stringify(json);
  }

};

module.exports = TeeTime;

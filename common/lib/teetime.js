//
// this represents the specifics of a tee time, converting it 
// to the correct time zone and determining when
// a given tee time can be booked with the country club site
// 
var moment = require('moment-timezone');
var ClockSync = require('../lib/clocksync');

var TeeTime = function (reservation) {

  var time = reservation.data.time;

  // all tee times come in as an Eastern time zone.  use moment-timezone
  // to parse the time appropriately regardless of the timezone of the
  // environment we're running in
  var etzMoment = moment.tz(time, "h:mm A MM/DD/YYYY", 'America/New_York');

  // compensate for any drift in the server time vs. real time.
  var delta = ClockSync.delta();

  var nowMilliseconds = function () {
    var now = new Date().getTime() + delta;
    return now;
  };

  this.getDate = function () {
    // console.log("etzMoment: " + etzMoment.format());
    var theTime = new Date(etzMoment.clone().utc().format());
    return new Date(theTime.getTime() + delta);
  };

  // calculate the first time we can actually book this tee
  // time.  the tee sheet opens at 7am three days before
  this.getTeeSheetOpenDate = function () {
    // console.log("etzMoment: " + etzMoment.format());

    // move to the beginning of the day of the reservation
    var m = etzMoment.clone().startOf("day");
    var date = new Date(m.utc().format());

    // console.log("getTeeSheetOpenDate: " + date.toString());

    // move back 3 days, then forward to 2 minutes before 7am
    // the tee sheet opens at 7am Eastern, but we cheat by 2 minutes to make
    // sure we get in before anyone else (i.e. 6:58 AM 3 days before)
    var theTime = new Date(date.getTime() - (3 * 24 * 60 * 60 * 1000) // back 3 days
      +
      (7 * 60 * 60 * 1000) // forward to 7am
      -
      (2 * 60 * 1000)); // back 2 minutes

    return new Date(theTime.getTime() + delta);
  };

  //
  // return true if the tee time is in the future, false otherwise
  //
  this.inTheFuture = function () {
    var now = nowMilliseconds();
    var reservedTime = this.getDate().getTime();

    if (reservedTime > now) {
      return true;
    }

    return false;
  }

  //
  // return true if the tee sheet is open for this
  //
  this.isTeeSheetOpen = function () {

    if (this.inTheFuture()) {
      // tee time hasn't already happened, now check if the tee sheet is open
      var now = nowMilliseconds();
      var openTime = this.getTeeSheetOpenDate().getTime();

      if (openTime <= now) {
        return true;
      }
    }

    return false;
  }

  this.toString = function () {
    return "teetime : " + this.getDate().toString() +
      ", teeshet : " + this.getTeeSheetOpenDate().toString();
  }

};

module.exports = TeeTime;
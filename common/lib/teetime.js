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
    return theTime;
  };

  //
  // calculate the first time we can actually book this tee
  // time.  the tee sheet opens at 7am three days before for Sat/Sun,
  // 14 days before for Tues-Thu
  // 
  this.getTeeSheetOpenDate = function () {
    // console.log("etzMoment: " + etzMoment.format());

    // move to the beginning of the day of the reservation
    var msInADay = 24 * 60 * 60 * 1000;
    var daysTillOpen = 0;

    var m = etzMoment.clone().startOf("day");
    var dayOfWeek = m.day();

    console.log("dayOfWeek " + dayOfWeek);

    if (dayOfWeek > 1 && dayOfWeek < 6) {
      // Tues-Fri is a 14 day window, back up appropriately
      m.subtract(14, 'days');

      // tee sheet opens at 7:30am on weekdays with new tee sheet rules
      m.hours(7).minutes(30);
    } else {
      // Sat/Sun are a 3 day window, back up appropriately
      m.subtract(3, 'days');

      // [11/07/2018] changed this back to exactly 7am with the new
      // tee sheet software; prior software allowed us to cheat
      //
      // // the tee sheet opens at 7am Eastern, but we cheat by 2 minutes to make
      // // sure we get in before anyone else (i.e. 6:58 AM the day the sheet opens)
      // m.hours(6).minutes(58);

      // start right at 7am with new tee sheet rules
      m.hours(7).minutes(0);
    }

    var date = new Date(m.utc().format());

    console.log("Tee sheet opens at : " + date.toString());

    return new Date(date.getTime() + delta);
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
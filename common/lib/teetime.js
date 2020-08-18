/**
 * this represents the specifics of a tee time, converting it 
 * to the correct time zone and determining when
 * a given tee time can be booked with the country club site
 */
var moment = require('moment-timezone');
var ClockSync = require('../lib/clocksync');

const TUESDAY = 2;
const FRIDAY = 5;

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

  /**
   * [djb 08/18/2020] The *$^!%% tee sheet system decided to move
   * back to just a single time which opens at 6:45AM vs. opening
   * at three different times.
   * 
   * calculate the times we can actually book this tee
   * time.  the tee sheet opens at 6:45 three days before for 
   * Sat/Sun, and 7:30am 14 days before for Tues-Thu
   * Monday the course is normally closed, except for key
   * holidays where it's treated like a weekend.
   * 
   * Note that this function returns an array of open dates because
   * the tee time system at one time had a policy of opening
   * each course at a different time to reduce demand on the
   * tee time system.
   */
  this.getTeeSheetOpenDates = function () {
    // console.log("etzMoment: " + etzMoment.format());

    // move to the beginning of the day of the reservation
    var m = etzMoment.clone().startOf("day");
    var dayOfWeek = m.day();
    const dates = [];

    console.log("dayOfWeek " + dayOfWeek);

    if (dayOfWeek >= TUESDAY && dayOfWeek <= FRIDAY) {
      // Tues-Fri is a 14 day window, back up appropriately
      m.subtract(14, 'days');

      // tee sheet opens at 7:30am on weekdays with new tee sheet rules
      m.hours(7).minutes(30);

      var date = new Date(m.utc().format());
      dates.push(new Date(date.getTime() + delta));
    } else {
      // Sat/Sun/Mon are a 3 day window, back up appropriately
      m.subtract(3, 'days');

      // [8/18/2020] changed this BACK to a single time for weekends
      //             ith tee sheet opening at 6:45AM for all courses
      //
      // [6/30/2020] changed this to deal with tee sheet opening at 
      //             6:40, 6:50 and 7:00am due to COVID tee sheet changes
      //
      // [11/07/2018] changed this back to exactly 7am with the new
      // tee sheet software; prior software allowed us to cheat
      //
      // // the tee sheet opens at 7am Eastern, but we cheat by 2 minutes to make
      // // sure we get in before anyone else (i.e. 6:58 AM the day the sheet opens)
      // m.hours(6).minutes(58);

      m.hours(6).minutes(45);

      var date = new Date(m.utc().format());      
      dates.push(new Date(date.getTime() + delta));
    }


    console.log("Tee sheet opens at : " + JSON.stringify(dates));

    return dates;
  };

  /**
   * calculate the first time we can actually book this tee
   * time.  
   */
  this.getTeeSheetOpenDate = function () {
    const dates = this.getTeeSheetOpenDates();
    return dates[0];
  };

  /**
   * return true if the tee time is in the future, false otherwise
   */
  this.inTheFuture = function () {
    var now = nowMilliseconds();
    var reservedTime = this.getDate().getTime();

    if (reservedTime > now) {
      return true;
    }

    return false;
  }

  /**
   * return true if the tee sheet is already open for this tee time
   */
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
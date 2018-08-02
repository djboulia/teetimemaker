//
// handles scheduling of tee times by setting a cron job to fire at the 
// appropriate time to invoke the TeeTimeAPI to book the time
//

var ClockSync = require('./clocksync.js');
var CronJob = require('cron').CronJob;
var TeeTimeAPI = require('./teetimeapi.js');


var Scheduler = function () {

  var job;
  var teetime = new TeeTimeAPI();

  //
  // make the reservation at the approriate time
  //
  this.add = function (reservation) {
    console.log("add: reservation: " + reservation.toString());

    return new Promise(function (resolve, reject) {
      ClockSync.getClockDelta()
        .then(function (delta) {
            console.log("delta: " + delta + "ms");
            console.log("tee time reservation: " + reservation.getDate().toString());

            var now = new Date().getTime();
            var reservedTime = reservation.getDate().getTime();

            if (reservedTime < now) {
              var str = "tee time occurs in the past, not scheduling reservation " +
                reservation.getDate().toString();
              reject(str);
              return;
            }

            var openTime = reservation.getTeeSheetOpenTime();
            var adjustedTime = new Date(openTime.getTime() + delta);
            console.log("setting job for: " + adjustedTime.toString());

            job = new CronJob(adjustedTime, function () {
                /* runs once at the specified date. */
                teetime.reserve(reservation)
                  .then(function (result) {
                      console.log(result);
                    },
                    function (err) {
                      console.log(err);
                    });
              },
              function () {
                /* This function is executed when the job stops */
              },
              true, /* Start the job right now */
              'America/New_York' /* Time zone of this job. */
            );

            job.start();
            resolve(adjustedTime);
          },
          function (err) {
            reject(err);
          });
    });

  };

  //
  // immediately try to make this reservation
  //
  this.now = function (reservation) {
    console.log("now: reservation: " + reservation.toString());

    return new Promise(function (resolve, reject) {
      var now = new Date().getTime();
      var adjustedTime = new Date(now + 2000); // now plus 2 secs

      job = new CronJob(adjustedTime, function () {
          /* runs once at the specified date. */
          teetime.search(reservation)
            .then(function (result) {
                console.log(result);
              },
              function (err) {
                console.log(err);
              });
        },
        function () {
          /* This function is executed when the job stops */
        },
        true, /* Start the job right now */
        'America/New_York' /* Time zone of this job. */
      );

      job.start();
    });

  };
};


module.exports = Scheduler;
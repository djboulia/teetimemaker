'use strict';

//
// handles scheduling of tee times by setting a cron job to fire at the 
// appropriate time to invoke the TeeTimeAPI to book the time
//

var CronJob = require('cron').CronJob;

var ClockSync = require('../lib/clocksync.js');
var TeeTimeAPI = require('../lib/teetimeapi.js');
var TeeTime = require('../lib/teetime.js');

module.exports = function (Scheduler) {

  var job;
  var teetimeService = new TeeTimeAPI();
  var app = require('../../server/server');

  //
  // make the teetime at the appropriate time
  //
  Scheduler.add = function (teetime) {
    console.log("add: teetime: " + teetime.toString());

    return new Promise(function (resolve, reject) {
      ClockSync.getClockDelta()
        .then(function (delta) {
            console.log("delta: " + delta + "ms");
            console.log("tee time reservation: " + teetime.getDate().toString());

            var now = new Date().getTime();
            var reservedTime = teetime.getDate().getTime();

            if (reservedTime < now) {
              var str = "tee time occurs in the past, not scheduling reservation " +
                teetime.getDate().toString();
              reject(str);
              return;
            }

            var openTime = teetime.getTeeSheetOpenTime();
            var adjustedTime = new Date(openTime.getTime() + delta);
            console.log("setting job for: " + adjustedTime.toString());

            job = new CronJob(adjustedTime, function () {
                /* runs once at the specified date. */
                teetimeService.reserve(teetime)
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
  Scheduler.now = function (teetime) {
    console.log("now: teetime: " + teetime.toString());

    return new Promise(function (resolve, reject) {
      var now = new Date().getTime();
      var adjustedTime = new Date(now + 2000); // now plus 2 secs

      job = new CronJob(adjustedTime, function () {
          /* runs once at the specified date. */
          teetimeService.search(teetime)
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

  //
  // when the server is first started, we look in the database
  // for reservation records and load them all into the scheduler
  //
  Scheduler.init = function () {

    return new Promise(function (resolve, reject) {
      var Reservation = app.models.Reservation.Promise;

      Reservation.find()
        .then(function (records) {

          console.log("found " + records.length + " records!");

          for (var i = 0; i < records.length; i++) {
            var record = records[i].data;

            var Member = app.models.Member.Promise;
            var id = record.member;

            Member.findCredentialsById(id)
              .then(function (user) {
                  var userid = user.username;
                  var password = user.password;
                  var time = record.time;
                  var courses = record.courses;

                  if (record.golfers.length > 3) {
                    reject("A maximum of 3 additional golfers allowed.  Reservation not made.");
                  } else {

                    // logged in user has to be first tee time entry
                    var golfers = record.golfers;
                    golfers.unshift({"name" : user.name, "id" : user.id});

                    var teetime = new TeeTime(userid, password,
                      time, courses, golfers);

                    // Scheduler.now(teetime)
                    Scheduler.add(teetime)
                      .then(function (time) {
                        console.log("tee time reservation will be made on " + time.toString());
                        resolve(time);
                      }, function (err) {
                        console.log(err);
                        reject(err);
                      });
                  }

                },
                function (err) {
                  reject(err);
                })


          }

        }, function (err) {
          console.log(err);
          reject(err);
        });

    });

  };


  //
  //  These are the methods to support the remote API
  //
  Scheduler.remoteMethod(
    'apiCreate', {
      http: {
        path: '/',
        verb: 'post',
      },
      description: 'Create a new reservation request',

      accepts: [{
          arg: 'time',
          type: 'string',
          required: true,
          description: 'username for PWCC site'
        },
        {
          arg: 'courses',
          type: 'array',
          required: true,
          description: 'array of course names, in order of preference.  Highlands, Meadows, Fairways'
        },
        {
          arg: 'golfers',
          type: 'array',
          required: true,
          description: 'array of other golfers to add to the tee time. Max of 3'
        },
        {
          arg: 'ctx',
          type: 'string',
          http: function (ctx) {
            var req = ctx && ctx.req;
            var accessToken = req && req.accessToken;
            var tokenID = accessToken ? accessToken.id : undefined;

            console.log("tokenID " + JSON.stringify(tokenID));
            console.log("accessToken " + JSON.stringify(accessToken));
            return (accessToken) ? accessToken.userId : undefined;
          },
          description: 'Do not supply this argument, it is automatically extracted ' +
            'from request headers.',
        }
      ],

      returns: {
        arg: 'reservation',
        type: 'object',
        root: true
      }
    }
  );

  Scheduler.apiCreate = function (time, courses, golfers, id, cb) {

    // get user credentials
    // create record in the db for this reservation
    // add it to the scheduler

    console.log("Scheduler.apiCreate with id " + id);

    var record = {
      data : {
        member : id,
        time: time,
        courses: courses,
        golfers: golfers
      }
    };

    var Reservation = app.models.Reservation.Promise;

    Reservation.create(record)
      .then(function (result) {
          cb(null, result);
        },
        function (err) {
          cb(err);
        });
  };

};
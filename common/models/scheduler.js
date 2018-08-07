'use strict';

//
// handles scheduling of tee times by setting a cron job to fire at the 
// appropriate time to invoke the TeeTimeAPI to book the time
//

var CronJob = require('cron').CronJob;

var TeeTime = require('../lib/teetime.js');

module.exports = function (Scheduler) {

  var app = require('../../server/server');

  var jobs = [];

  //
  // run a job at the specified date
  //
  var addJob = function (time, id) {
    var job = new CronJob(time, function () {
        var Reservation = app.models.Reservation.Promise;

        Reservation.reserve(id)
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

    // keep track of started jobs so we can find them later
    // if changes are made
    jobs[id] = job;
  };

  //
  // make the teetime at the appropriate time
  //
  Scheduler.add = function (record) {

    return new Promise(function (resolve, reject) {

      var id = record.id;
      var teetime = new TeeTime(record);
      var openTime = teetime.getTeeSheetOpenDate();

      console.log("tee time reservation: " + teetime.getDate().toString());

      console.log("setting job for: " + openTime.toString());

      if (!teetime.inTheFuture()) {
        var str = "Tee time occurs in the past, not processing " + teetime.getDate().toString();
        console.log(str);
        resolve(str);
      } else if (teetime.isTeeSheetOpen()) {
        // make the reservation right now
        var str = "Tee sheet is open, reserving " + teetime.getDate().toString() + " now.";
        console.log(str);

        // set the job for 2 secs in the future
        var now = new Date().getTime();
        var adjustedTime = new Date(now + 2000);

        addJob(adjustedTime, id);

        resolve(str);
      } else {
        var str = "Scheduling reservation on " + openTime.toString();
        console.log(str);

        addJob(openTime, id);

        resolve(str);
      }
    });

  };


  //
  // when the server is first started, we look in the database
  // for existing reservation records and load them all into the scheduler
  //
  Scheduler.init = function () {

    return new Promise(function (resolve, reject) {
      var Reservation = app.models.Reservation.Promise;

      // filter only unprocessed records
      var options = {
        where: {
          processed: {
            exists : false
          }
        }
      };

      Reservation.findWithOptions(options)
        .then(function (records) {
          var promises = [];

          console.log("found " + records.length + " records!");

          if (records.length==0) {
            resolve([]);
          }

          for (var i = 0; i < records.length; i++) {
            var record = records[i];

            console.log("record: " + JSON.stringify(record));

            // add it as a future job
            promises.push(Scheduler.add(record));

            // wait for all of the promises to finish
            Promise.all(promises)
              .then(function (results) {
                  resolve(results);
                },
                function (err) {
                  console.log("error! " + err);
                  reject(err);
                });
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
      data: {
        member: id,
        time: time,
        courses: courses,
        golfers: golfers
      }
    };

    var Reservation = app.models.Reservation.Promise;

    Reservation.create(record)
      .then(function (result) {
          Scheduler.add(result)
            .then(function (str) {
                cb(null, str);
              },
              function (err) {
                cb(err);
              });
        },
        function (err) {
          cb(err);
        });
  };

};
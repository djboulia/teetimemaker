'use strict';

var CronJob = require('cron').CronJob;
var TeeTime = require('../lib/teetime.js');

/**
 * handles scheduling of tee times by setting a cron job to fire at the 
 * appropriate time to invoke the TeeTimeAPI to book the time
 */
module.exports = function (Scheduler) {

  var app = require('../../server/server');

  /**
   * Use this method to extract the access token from the 
   * http headers.  a valid login token is required to access 
   * the API methods
   * 
   * @param {Object} ctx context object with http headers
   */
  const getAccessToken = function (ctx) {
    var req = ctx && ctx.req;
    var accessToken = req && req.accessToken;
    var tokenID = accessToken ? accessToken.id : undefined;

    console.log("tokenID " + JSON.stringify(tokenID));
    console.log("accessToken " + JSON.stringify(accessToken));
    return (accessToken) ? accessToken.userId : undefined;
  };

  /**
   * keep a list of the active cron jobs so we can delete 
   * previously scheduled tee times
   */
  var jobs = [];

  /**
   * book the tee time
   * 
   * @param {Date} time when to make the reservation
   * @param {String} id model id for this reservation
   * @param {Object} session holds a logged in session to use for reservation
   */
  var doReservation = function (time, id, session) {
    var job = new CronJob(time, function () {
        console.log("doReservation cron job running");

        var Reservation = app.models.Reservation.Promise;

        Reservation.reserve(id, session)
          .then(function (result) {
              console.log(JSON.stringify(result));
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
  };

  /**
   * make the reservation at the specified date
   * we do this in two steps: 
   * 1) log in as the specified user one minute prior
   * 2) after login, make the reservation at the given time
   * 
   * @param {Date} time the date and time to run this job
   * @param {String} id model id for this reservation
   */
  var addJob = function (time, id) {
    const ONE_SECOND = 1000;
    const ONE_MINUTE = 60 * ONE_SECOND;
    const INTERVAL = ONE_MINUTE;

    let timeToLogin = time.getTime();
    timeToLogin -= INTERVAL; // log in a minute early

    const now = Date.now();
    if (timeToLogin <= now) {
      // don't set a cron job in the past, just make it a second in the future
      console.log("login cron job would be in the past, adjusting to run immediately.");
      timeToLogin = now + ONE_SECOND;
      time = new Date(now + INTERVAL);
    }

    var job = new CronJob(new Date(timeToLogin), function () {
        const startTime = Date.now();
        const Reservation = app.models.Reservation.Promise;

        Reservation.findById(id)
          .then(function (record) {
            const result = record.data.result;

            Reservation.login(id)
              .then(function (session) {

                const now = Date.now();
                const elapsed = now - startTime;

                if (elapsed >= INTERVAL) {
                  // took us more than a minute to login, just trigger the reservation now
                  time = new Date(now + ONE_SECOND); // run one second from now
                  console.log("logged in, making reservation in 1 second.");
                } else {
                  const secsLeft = (INTERVAL - elapsed) / 1000;
                  console.log("logged in, making reservation in " + secsLeft + " seconds.");
                }

                doReservation(time, id, session);

                jobs[id] = undefined; // remove this job from our list of active jobs

              }, function (err) {
                console.log("Reservation.login failed:");
                console.log(err);
              });

          }, function(err) {
            console.log("Reservation.findById failed:");
            console.log(err);
          });
      },
      function () {
        // This function is executed when the job stops
      },
      true, // Start the job right now
      'America/New_York' // Time zone of this job.
    );

    job.start();

    // keep track of started jobs so we can find them later
    // if changes are made
    jobs[id] = job;
  };

  /**
   * determine what to do with this tee time.  Three options:
   * 
   * 1) For those in the past, we do nothing as the tee time already happened.
   * 
   * 2) For reservations that could be made now, kick off a job to
   *    schedule it.
   * 
   * 3) For those where the tee sheet isn't open yet, schedule a 
   *    future job to make the tee time.
   */
  var scheduleTeeTime = function (record) {

    return new Promise(function (resolve, reject) {

      var id = record.id;
      var teetime = new TeeTime(record);

      console.log("tee time reservation: " + teetime.getDate().toString());

      if (!teetime.inTheFuture()) {
        var str = "Tee time occurs in the past, not processing " + teetime.getDate().toString();
        console.log(str);
        resolve(str);
      } else if (teetime.isTeeSheetOpen()) {
        // make the reservation right now

        var str = "Tee sheet is open, reserving " + teetime.getDate().toString() + " now.";
        console.log(str);

        // set the job to run immediately
        var now = new Date().getTime();
        // var now = new Date().getTime() + (1500 * 60); // TEST
        var adjustedTime = new Date(now);

        addJob(adjustedTime, id);

        resolve(str);
      } else {
        var openTimes = teetime.getTeeSheetOpenDates();
        var str = "Scheduling reservations on " + JSON.stringify(openTimes);

        for (let i = 0; i < openTimes.length; i++) {
          const openTime = openTimes[i];

          console.log("setting job for: " + openTime.toString());

          console.log(str);

          addJob(openTime, id);
        }

        resolve(str);
      }
    });

  };

  /**
   * when the server is first started, we look in the database
   * for existing reservation records and load them all into the scheduler
   */
  Scheduler.init = function () {

    return new Promise(function (resolve, reject) {
      var Reservation = app.models.Reservation.Promise;

      // filter only unprocessed records
      var options = {
        where: {
          processed: {
            exists: false
          }
        }
      };

      Reservation.findWithOptions(options)
        .then(function (records) {
          var promises = [];

          console.log("found " + records.length + " records!");

          if (records.length == 0) {
            resolve([]);
          }

          for (var i = 0; i < records.length; i++) {
            var record = records[i];

            console.log("record: " + JSON.stringify(record));

            // add it as a future job
            promises.push(scheduleTeeTime(record));

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


  /**
   * These are the methods to support the remote API
   */
  Scheduler.remoteMethod(
    'create', {
      http: {
        path: '/',
        verb: 'post',
      },
      description: 'Create a new reservation request',

      accepts: [{
          arg: 'time',
          type: 'string',
          required: true,
          description: 'time to reserve. format: hh:mm [AM|PM] MM/DD/YYYY'
        },
        {
          arg: 'courses',
          type: 'array',
          required: true,
          description: 'array of course names, in order of preference.  Valid values: Highlands, Meadows, Fairways'
        },
        {
          arg: 'golfers',
          type: 'array',
          required: true,
          description: 'array of other golfers to add to the tee time. Max of three.'
        },
        {
          arg: 'ctx',
          type: 'string',
          http: getAccessToken,
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

  Scheduler.remoteMethod(
    'list', {
      http: {
        path: '/',
        verb: 'get',
      },
      description: 'List the outstanding tee times yet to be scheduled for this user.',

      accepts: [{
        arg: 'ctx',
        type: 'string',
        http: getAccessToken,
        description: 'Do not supply this argument, it is automatically extracted ' +
          'from request headers.',
      }],

      returns: {
        arg: 'records',
        type: 'array',
        root: true
      }
    }
  );

  Scheduler.remoteMethod(
    'get', {
      http: {
        path: '/:id',
        verb: 'get',
      },
      description: 'Get the specified reservation.',

      accepts: [{
          arg: 'id',
          type: 'string',
          required: true
        },
        {
          arg: 'ctx',
          type: 'string',
          http: getAccessToken,
          description: 'Do not supply this argument, it is automatically extracted ' +
            'from request headers.',
        }
      ],

      returns: {
        arg: 'records',
        type: 'array',
        root: true
      }
    }
  );

  Scheduler.remoteMethod(
    'delete', {
      http: {
        path: '/:id',
        verb: 'delete',
      },
      description: 'Remove the scheduled reservation.',

      accepts: [{
          arg: 'id',
          type: 'string',
          required: true
        },
        {
          arg: 'ctx',
          type: 'string',
          http: getAccessToken,
          description: 'Do not supply this argument, it is automatically extracted ' +
            'from request headers.',
        }
      ],

      returns: {
        arg: 'records',
        type: 'array',
        root: true
      }
    }
  );

  Scheduler.remoteMethod(
    'listHistory', {
      http: {
        path: '/history',
        verb: 'get',
      },
      description: 'List the prior tee times for this user.',

      accepts: [{
        arg: 'ctx',
        type: 'string',
        http: getAccessToken,
        description: 'Do not supply this argument, it is automatically extracted ' +
          'from request headers.',
      }],

      returns: {
        arg: 'records',
        type: 'array',
        root: true
      }
    }
  );



  /**
   * get user credentials
   * create record in the db for this reservation
   * add it to the scheduler
   */
  Scheduler.create = function (time, courses, golfers, id, cb) {

    if (!id) {
      cb("Not authenticated.  Login first.");
      return;
    }

    console.log("Scheduler.create with id " + id);

    var record = {
      data: {
        member: id,
        time: time,
        courses: courses,
        golfers: []
      }
    };

    for (var i = 0; i < golfers.length; i++) {
      var golfer = golfers[i];

      record.data.golfers.push({
        name: golfer.name.toString(),
        id: golfer.id.toString(),
        username: golfer.username.toString(),
        ghin: golfer.ghin.toString()
      });
    }

    console.log("creating record: " + JSON.stringify(record));

    var Reservation = app.models.Reservation.Promise;

    Reservation.create(record)
      .then(function (result) {
          scheduleTeeTime(result)
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

  /**
   * show all upcoming reservations for this member
   */
  Scheduler.list = function (id, cb) {

    console.log("Scheduler.list for member " + id);

    if (!id) {
      cb("Not authenticated.  Login first.");
      return;
    }

    // find any reservations that have not yet been processed
    var Reservation = app.models.Reservation.Promise;

    // filter only unprocessed records
    var options = {
      where: {
        processed: {
          exists: false
        }
      }
    };

    Reservation.findWithOptions(options)
      .then(function (records) {

        var result = [];

        console.log("found " + records.length + " records!");


        for (var i = 0; i < records.length; i++) {
          var record = records[i];

          var teetime = new TeeTime(record);

          // ignore tee times that have already gone by
          if (teetime.inTheFuture()) {
            // now see if the record is owned by the current logged in user
            if (record.data.member == id) {
              var data = {
                id: record.id,
                teetime: teetime.getDate().toString(),
                scheduled: teetime.getTeeSheetOpenDate().toString(),
                courses: record.data.courses,
                golfers: record.data.golfers
              }

              console.log("record: " + JSON.stringify(record));
              result.push(data);
            } else {
              console.log("tee time not owned by " + id + ", not adding record " + record.id);
            }
          } else {
            console.log("tee time in the past, not adding record " + record.id);
          }

        }

        cb(null, result);

      }, function (err) {
        console.log(err);
        cb(err);
      });
  };

  /**
   * get a pending reservations for a member
   */
  Scheduler.get = function (id, memberId, cb) {
    console.log("Scheduler.get with id " + id);

    if (!memberId) {
      cb("Not authenticated.  Login first.");
      return;
    }

    // find the record, make sure this member is the owner
    var Reservation = app.models.Reservation.Promise;

    Reservation.findById(id)
      .then(function (record) {

          if (!record || !record.data) {
            var str = "Reservation with id " + id + " not found.";
            cb(str);
            return;
          }

          if (record.data.member != memberId) {
            var str = "This reservation not owned by the logged in member.";
            cb(str);
            return;
          }

          var teetime = new TeeTime(record);

          if (!teetime.isTeeSheetOpen()) {
            // tee time hasn't been booked yet, show reservation data
            var data = {
              id: record.id,
              teetime: teetime.getDate().toString(),
              scheduled: teetime.getTeeSheetOpenDate().toString(),
              courses: record.data.courses,
              golfers: record.data.golfers
            }

            cb(null, data);
          } else {
            // already processed record, show results
            var data = {
              id: record.id,
              teetime: teetime.getDate().toString(),
              courses: record.data.courses,
              golfers: record.data.golfers,
              result: record.data.result
            }
            cb(null, data);
          }
        },
        function (err) {
          cb(err);
        })
  };

  /**
   * delete a pending reservations for a member
   */
  Scheduler.delete = function (id, memberId, cb) {
    console.log("Scheduler.delete with id " + id);

    if (!memberId) {
      cb("Not authenticated.  Login first.");
      return;
    }

    // find the record, make sure this member is the owner
    var Reservation = app.models.Reservation.Promise;

    Reservation.findById(id)
      .then(function (record) {

          if (!record || !record.data) {
            var str = "Reservation with id " + id + " not found.";
            cb(str);
            return;
          }

          if (record.data.member != memberId) {
            var str = "This reservation not owned by the logged in member.";
            cb(str);
            return;
          }

          // cancel the pending job
          var job = jobs[id];
          if (!job) {
            var str = "No pending job found for id " + id;
            cb(str);
            return;
          }

          if (!job.running) {
            var str = "No running job for id " + id;
            cb(str);
            return;
          }

          job.stop();

          if (job.running) {
            var str = "Attempted to stop job, but still shows running for id " + id;
            cb(str);
            return;
          } else {
            console.log("Stopped job for id " + id);
            jobs[id] = undefined;
          }

          // delete the specified record
          Reservation.destroyById(id)
            .then(function () {
                var str = "Deleted scheduled job";
                console.log(str);
                cb(null, str);
              },
              function (err) {
                cb(err);
              })

        },
        function (err) {
          cb(err);
        })

  };

  /**
   * show all past reservations for this member
   */
  Scheduler.listHistory = function (id, cb) {

    console.log("Scheduler.listHistory for member " + id);

    if (!id) {
      cb("Not authenticated.  Login first.");
      return;
    }

    // find any reservations that have not yet been processed
    var Reservation = app.models.Reservation.Promise;

    // we want the history, so filter only already processed records
    var options = {
      where: {
        processed: {
          eq: true
        }
      }
    };

    Reservation.findWithOptions(options)
      .then(function (records) {

        var result = [];

        console.log("found " + records.length + " records!");


        for (var i = 0; i < records.length; i++) {
          var record = records[i];

          var teetime = new TeeTime(record);

          // now see if the record is owned by the current logged in user
          if (record.data.member == id) {
            var data = {
              id: record.id,
              teetime: teetime.getDate().toString(),
              courses: record.data.courses,
              golfers: record.data.golfers,
              result: record.data.result
            }

            console.log("record: " + JSON.stringify(record));
            result.push(data);
          } else {
            console.log("tee time not owned by " + id + ", not adding record " + record.id);
          }

        }

        //
        // sort the result in reverse order (most recent first)
        //
        result.sort(function (a, b) {
          var aTeeTime = new Date(a.teetime).getTime();
          var bTeeTime = new Date(b.teetime).getTime();

          if (bTeeTime < aTeeTime) {
            return -1;
          } else if (bTeeTime > aTeeTime) {
            return 1;
          } else {
            return 0;
          }

        });

        cb(null, result);

      }, function (err) {
        console.log(err);
        cb(err);
      });
  };

};
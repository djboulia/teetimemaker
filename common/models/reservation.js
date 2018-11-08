'use strict';

var app = require('../../server/server');

var TeeTime = require('../lib/teetime.js');
var TeeTimeAPI = require('../lib/pwcc/teetimeapi.js');

module.exports = function (Reservation) {
  var teeTimeAPI = new TeeTimeAPI();

  /**
   * create promise-friendly versions of key functions we use internally
   * in the other modules
   **/
  Reservation.Promise = {};

  Reservation.Promise.create = function (record) {
    return new Promise(function (resolve, reject) {

      var teetime = new TeeTime(record);
      var teeTimeAPI = new TeeTimeAPI();

      if (!teetime.inTheFuture()) {
        var str = "tee time occurs in the past, not scheduling reservation " +
          teetime.getDate().toString();
        reject(str);
        return;
      }

      if (record.data.golfers.length > 3) {
        reject("A maximum of 3 additional golfers allowed.  Not scheduling reservation.");
        return;
      }

      if (!teeTimeAPI.validCourses(record.data.courses)) {
        reject("Reservation not scheduled.  Course list is invalid: " + JSON.stringify(courses));
        return;
      }

      Reservation.create(record, function (err, result) {
        if (!err) {
          resolve(result);
        } else {
          var str = "Error!" + JSON.stringify(err);
          reject(str);
        }
      });
    });
  };

  Reservation.Promise.destroyById = function (id) {
    return new Promise(function (resolve, reject) {

      Reservation.destroyById(id, function (err) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  };

  Reservation.Promise.findById = function (id) {
    return new Promise(function (resolve, reject) {

      Reservation.findById(id, function (err, record) {
        if (!err) {
          resolve(record);
        } else {
          reject(err);
        }
      });
    });
  };

  Reservation.Promise.update = function (record) {
    return new Promise(function (resolve, reject) {

      Reservation.replaceOrCreate(record, function (err, record) {
        if (!err && record) {

          resolve(record);

        } else {
          if (err) {
            var str = "Error!" + JSON.stringify(err);
            reject(str);
          } else {
            var str = "Could not update Reservation!";
            reject(str);
          }
        }
      });

    });
  };

  Reservation.Promise.find = function () {
    return new Promise(function (resolve, reject) {

      Reservation.find(function (err, records) {
        if (!err) {
          resolve(records);
        } else {
          var str = "Error!" + JSON.stringify(err);
          reject(str);
        }
      });
    });
  };

  Reservation.Promise.findWithOptions = function (options) {
    return new Promise(function (resolve, reject) {

      Reservation.find(options, function (err, records) {
        if (!err) {
          resolve(records);
        } else {
          var str = "Error!" + JSON.stringify(err);
          reject(str);
        }
      });
    });
  };

  Reservation.Promise.reserve = function (id) {
    return new Promise(function (resolve, reject) {

        Reservation.Promise.findById(id)
          .then(function (record) {

              var Member = app.models.Member.Promise;
              var memberId = record.data.member;

              Member.findCredentialsById(memberId)
                .then(function (user) {
                  var userid = user.username;
                  var password = user.password;
                  var time = record.data.time;
                  var courses = record.data.courses;

                  // build the reamining foursome members; 
                  // logged in user is implied as first tee time
                  var golfers = [];

                  for (var i=0; i<record.data.golfers.length; i++) {
                    var golfer = record.data.golfers[i];
                    golfers.push(golfer);
                  }

                  teeTimeAPI.reserve(userid, password, time, courses, golfers)
                    .then(function (time) {
                        // update our reservation record to indicate we've
                        // made the reservation
                        record.processed = true;
                        record.data.result = {
                          status: "success",
                          response: time
                        };

                        Reservation.Promise.update(record)
                          .then(function (result) {
                              resolve(time);
                            },
                            function (err) {
                              reject(err);
                            });
                      },
                      function (err) {
                        // update our reservation record to indicate we've
                        // processed the record, but there was an error
                        record.processed = true;
                        record.data.result = {
                          status: "error",
                          response: err
                        };

                        Reservation.Promise.update(record)
                          .then(function (result) {
                              reject(err);
                            },
                            function (err) {
                              reject(err);
                            });
                      });
                });

            },
            function (err) {
              reject(err);
            });
      },
      function (err) {
        reject(err);
      })

  };

};
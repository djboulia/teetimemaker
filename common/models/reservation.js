'use strict';

var app = require('../../server/server');

var TeeTime = require('../lib/teetime.js');
var TeeTimeAPI = require('../lib/pwcc/teetimeapi.js');

module.exports = function (Reservation) {

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

  /**
   * login the user who made this reservation.
   * 
   * @param {String} id reservation identifier
   * @returns logged in tee time session
   */
  Reservation.Promise.login = function (id) {

    return new Promise(function (resolve, reject) {

      Reservation.Promise.findById(id)
        .then(function (record) {

          var Member = app.models.Member.Promise;
          var memberId = record.data.member;

          Member.findCredentialsById(memberId)
            .then(function (user) {
              var userid = user.username;
              var password = user.password;

              var teeTimeAPI = new TeeTimeAPI();

              teeTimeAPI.login(userid, password)
                .then(function (result) { // reserve result
                  resolve(teeTimeAPI);
                },
                  function (err) {
                    console.log("Error: " + err);

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

  /**
   * get current server time
   * 
   * @param {String} id reservation identifier
   * @returns logged in tee time session
   */
  Reservation.Promise.serverTime = function (teeTimeAPI) {

    return new Promise(function (resolve, reject) {

      teeTimeAPI.currentTime()
        .then((result) => {
          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });

    })
  };

  /**
   * use this to actually book the tee time.  login first with the
   * login method, then use the returned session to reserve the time
   * 
   * @param {String} id 
   * @param {Object} teeTimeAPI 
   * @returns 
   */
  Reservation.Promise.reserve = function (id, teeTimeAPI) {

    return new Promise(function (resolve, reject) {

      Reservation.Promise.findById(id)
        .then(function (record) {

          var time = record.data.time;
          var courses = record.data.courses;

          // build the remaining foursome members; 
          // logged in user is implied as first tee time
          var golfers = [];

          for (var i = 0; i < record.data.golfers.length; i++) {
            var golfer = record.data.golfers[i];
            golfers.push(golfer);
          }

          teeTimeAPI.reserve(time, courses, golfers)
            .then(function (time) { // reserve result
              console.log("Reservation success!");

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
                console.log("Error: " + err);

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

        },
          function (err) {
            reject(err);
          });
    },
      function (err) {
        reject(err);
      })

  };

  Reservation.Promise.reserveByTimeSlot = function (id, timeslots, teeTimeAPI) {

    return new Promise(function (resolve, reject) {

      Reservation.Promise.findById(id)
        .then(function (record) {

          // build the remaining foursome members; 
          // logged in user is implied as first tee time
          var golfers = [];

          for (var i = 0; i < record.data.golfers.length; i++) {
            var golfer = record.data.golfers[i];
            golfers.push(golfer);
          }

          teeTimeAPI.reserveByTimeSlot(timeslots, golfers)
            .then(function (time) { // reserve result
              console.log("Reservation success!");

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
                console.log("Error: " + err);

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

        },
          function (err) {
            reject(err);
          });
    },
      function (err) {
        reject(err);
      })

  };

  Reservation.Promise.search = function (id, teeTimeAPI) {

    return new Promise(function (resolve, reject) {

      Reservation.Promise.findById(id)
        .then(function (record) {

          var time = record.data.time;
          var courses = record.data.courses;

          teeTimeAPI.search(time, courses)
            .then(function (timeslots) { // reserve result
              console.log("Search success!");

              resolve(timeslots);
            },
              function (err) {
                console.log("Error: " + err);
                reject(err);
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
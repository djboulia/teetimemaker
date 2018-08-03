'use strict';

module.exports = function (Reservation) {
  /**
   * create promise-friendly versions of key functions we use internally
   * in the other modules
   **/
  Reservation.Promise = {};

  Reservation.Promise.create = function (record) {
    return new Promise(function (resolve, reject) {

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

};
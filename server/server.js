'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var Scheduler = require('./lib/scheduler.js');
var Reservation = require('./lib/reservation.js');

var app = module.exports = loopback();

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);

    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }

    var scheduler = new Scheduler();

    var ReservationDb = app.models.Reservation.Promise;
    ReservationDb.find()
      .then(function (records) {

        console.log("found " + records.length + " records!");

        for (var i = 0; i < records.length; i++) {
          var record = records[i].data;

          var userid = record.userid;
          var password = record.password;
          var time = record.time;
          var courses = record.courses;
          var golfers = record.golfers;

          var reservation = new Reservation(userid, password,
            time, courses, golfers);

          // scheduler.now(reservation)
          scheduler.add(reservation)
            .then(function (time) {
              console.log("tee time reservation will be made on " +
                time.toString());
            }, function (err) {
              console.log(err);
            });
        }

      }, function (err) {
        console.log(err);
      });

  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
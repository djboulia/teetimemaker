'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');

var ClockSync = require('../common/lib/clocksync.js');

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

    if (process.env.NODE_ENV) {
      console.log("App started in " + process.env.NODE_ENV + " mode.");
    } else {
      console.log("App started in DEVELOPMENT mode.  Test API calls/db will be used!");
    }

    var Scheduler = app.models.Scheduler;

    ClockSync.init()
      .then(function () {
        return Scheduler.init(); // promise
      })
      .then(function () {
        console.log("Scheduler initialized.");
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
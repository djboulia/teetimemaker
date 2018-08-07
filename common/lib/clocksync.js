// the server this code deploys on could have a pretty lousy clock, 
// and we need events to fire near the time of the tee sheet opening in order
// to get the best time we use NTP to calculate server drift and return 
// the delta

var ntpsync = require('ntpsync');

var initialized = false;
var ntpInProgress = false;
var ntpPromise = null;
var delta = 0;

//
// return the difference (in ms) between this clock and the time servers
//
exports.delta = function() {
  if (!initialized) {
    console.log("call init() first to establish delta!");
  }

  return delta;
}

//
// call this function when the server starts up to establish the delta offset
//
exports.init = function () {

  if (!ntpInProgress) {
    ntpPromise = new Promise(function (resolve, reject) {
      ntpsync.ntpLocalClockDeltaPromise({
        fTimeoutLatencyMS: 4000,
        fBurstTimeoutMS: 12000
      }).then((iNTPData) => {
        console.log("current system time", new Date());
        console.log(`(Local Time - NTP Time) Delta = ${iNTPData.minimalNTPLatencyDelta} ms`);
        console.log(`Minimal Ping Latency was ${iNTPData.minimalNTPLatency} ms`);
        console.log(`Total ${iNTPData.totalSampleCount} successful NTP Pings`);

        ntpInProgress = false;
        delta = iNTPData.minimalNTPLatencyDelta;
        initialized = true;

        resolve(delta);

      }).catch((err) => {
        console.log(err);
        console.log("couldn't calculate time drift, assuming zero");

        ntpInProgress = false;
        delta = 0;

        resolve(delta); // just assume no time drift
      });
    });

    // the ntpsync library won't allow multiple calls concurrently,
    // so we track whether we're in the middle of a call already
    // in this case we just fall through and return the already
    // established promise from the first invocation
    ntpInProgress = true;

  }

  return ntpPromise;
};
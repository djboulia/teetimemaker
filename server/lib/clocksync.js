// the server this code deploys on could have a pretty lousy clock, 
// and we need events to fire near the time of the tee sheet opening in order
// to get the best time we use NTP to calculate server drift and return 
// the delta

var ntpsync = require('ntpsync');

var ntpInProgress = false;
var ntpPromise = null;

exports.getClockDelta = function () {

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

        resolve(iNTPData.minimalNTPLatencyDelta);

      }).catch((err) => {
        console.log(err);
        console.log("couldn't calculate time drift, assuming zero");

        ntpInProgress = false;

        resolve(0); // just assume no time drift
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
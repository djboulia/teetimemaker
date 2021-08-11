'use strict';

var Password = require('../lib/password.js');
var TeeTimeAPI = require('../lib/pwcc/teetimeapi.js');
var logger = require('../lib/logger.js');
var app = require('../../server/server');

var newMemberRecord = function (username, password, info) {
  var encryptedPassword = Password.encrypt(password);
  var str = "username = " + username + ", password = " + encryptedPassword;

  console.log(str);

  var record = {};

  record.username = username;
  record.password = password;

  if (!info) {
    console.log("Warning! Invalid user info found" + JSON.stringify(info));
  }

  record.data = {};
  record.data.username = username;
  record.data.password = encryptedPassword;
  record.data.name = info.name;
  record.data.id = info.id;

  return record;
};

var updateMemberRecord = function (record, username, password, info) {
  var encryptedPassword = Password.encrypt(password);
  var str = "username = " + username + ", password = " + encryptedPassword;

  console.log(str);

  record.username = username;
  record.password = password;

  if (!info || !info.teeSheetInfo) {
    console.log("Warning! Invalid user info found" + JSON.stringify(info));
  }

  record.data.username = username;
  record.data.password = encryptedPassword;
  record.data.name = info.name;
  record.data.id = info.id;

  return record;
};

/**
 * extract the relevant PWCC credentials from the database
 * record.  this decrypts the password and only returns the
 * stuff relevant for PWCC login
 * 
 * @param {Object} record holds user data from the database
 */
var userCredentialsFromRecord = function (record) {
  var obj = {};

  obj.username = record.data.username;
  obj.password = Password.decrypt(record.data.password);
  obj.name = record.data.name;
  obj.id = record.data.id;

  return obj;
};

var users = {};

module.exports = function (Member) {
  /**
   * create promise-friendly versions of key functions we use internally
   * in the other modules
   **/
  Member.Promise = {};

  Member.Promise.find = function () {
    return new Promise(function (resolve, reject) {

      var User = app.models.User;

      User.find(function (err, records) {
        if (!err) {
          resolve(records);
        } else {
          var str = "Error!" + JSON.stringify(err);
          reject(str);
        }
      });
    });
  };

  Member.Promise.findByUsername = function (username) {
    return new Promise(function (resolve, reject) {

      Member.Promise.find()
        .then(function (records) {

            var found = null;

            for (var i = 0; i < records.length; i++) {
              var record = records[i];

              var data = record.data;

              if (data.username == username) {
                found = record;
                break;
              }
            }

            resolve(found);
          },
          function (err) {
            reject(err);
          });
    });
  };

  Member.Promise.findById = function (id) {
    return new Promise(function (resolve, reject) {
      var User = app.models.User;

      User.findById(id, function (err, record) {
        if (!err) {
          resolve(record);
        } else {
          reject(err);
        }
      });
    });
  };

  Member.Promise.findCredentialsById = function (id) {
    return new Promise(function (resolve, reject) {
      Member.Promise.findById(id)
        .then(function (record) {
            resolve(userCredentialsFromRecord(record));
          },
          function (err) {
            reject(err);
          });
    });
  };

  Member.Promise.create = function (record) {
    return new Promise(function (resolve, reject) {
      var User = app.models.User;

      User.create(record, function (err, record) {
        if (!err && record) {

          var id = record.id;

          logger.log("created record: " + id);

          resolve(record);

        } else {
          if (!record) {
            var str = "Could not create member";
            logger.error(str);
            reject(str);
          } else {
            var str = "Error!" + JSON.stringify(err);
            logger.error(str);
            reject(str);
          }
        }
      });
    });
  };

  Member.Promise.update = function (record) {
    return new Promise(function (resolve, reject) {

      var User = app.models.User;

      User.replaceOrCreate(record, function (err, record) {
        if (!err && record) {

          resolve(record);

        } else {
          if (err) {
            var str = "Error!" + JSON.stringify(err);
            reject(str);
          } else {
            var str = "Could not update Member!";
            reject(str);
          }
        }
      });

    });
  };


  Member.remoteMethod(
    'createMember', {
      http: {
        path: '/',
        verb: 'post',
      },
      description: 'Create a new user with PWCC credentials',

      accepts: [{
          arg: 'username',
          type: 'string',
          required: true,
          description: 'username for PWCC site'
        },
        {
          arg: 'password',
          type: 'string',
          required: true,
          description: 'Password for PWCC site'
        }
      ],

      returns: {
        arg: 'user',
        type: 'object',
        root: true
      }
    }
  );

  Member.remoteMethod(
    'updateMember', {
      http: {
        path: '/',
        verb: 'put',
      },
      description: 'Update a PWCC credentials (e.g. password change) for a user',

      accepts: [{
          arg: 'username',
          type: 'string',
          required: true,
          description: 'username for PWCC site'
        },
        {
          arg: 'password',
          type: 'string',
          required: true,
          description: 'Password for PWCC site'
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
        arg: 'user',
        type: 'object',
        root: true
      }
    }
  );

  Member.remoteMethod(
    'login', {
      http: {
        path: '/login',
        verb: 'post',
      },
      description: 'Login with PWCC credentials',

      accepts: [{
          arg: 'username',
          type: 'string',
          required: true,
          description: 'Username for PWCC site',
        },
        {
          arg: 'password',
          type: 'string',
          required: true,
          description: 'Password for PWCC site',
        }
      ],

      returns: {
        arg: 'token',
        type: 'object',
        root: true
      }
    }
  );

  Member.remoteMethod(
    'logout', {
      description: 'Logout of this session with access token.',
      accepts: [{
        arg: 'access_token',
        type: 'string',
        http: function (ctx) {
          var req = ctx && ctx.req;
          var accessToken = req && req.accessToken;
          var tokenID = accessToken ? accessToken.id : undefined;

          return tokenID;
        },
        description: 'Do not supply this argument, it is automatically extracted ' +
          'from request headers.',
      }, ],
      http: {
        verb: 'all'
      },
    }
  );

  Member.remoteMethod(
    'search', {
      http: {
        path: '/search',
        verb: 'post',
      },
      description: 'Search for members by last name.',
      accepts: [{
          arg: 'lastname',
          type: 'string',
          required: true,
          description: 'Last name of member to search for on PWCC site',
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
        arg: 'username',
        type: 'object',
        root: true
      }
    }
  );


  Member.createMember = function (username, password, cb) {

    console.log("member.createMember");

    Member.Promise.findByUsername(username)
      .then(function (record) {
          if (record == null) {

            // no existing user record, now go look for additional info
            var teetime = new TeeTimeAPI();

            teetime.login(username, password)
              .then(function (result) {
                // successful login
                return teetime.memberInfo();
              })
              .then(function (result) {
                  // result of info() call
                  console.log("Member info: " + JSON.stringify(result));

                  // add a new entry to the database
                  var record = newMemberRecord(username, password, result);

                  Member.Promise.create(record)
                    .then(function (record) {
                        cb(null, record);
                      },
                      function (err) {
                        cb(err);
                      });
                },
                function (err) {
                  cb("Error " + err + " Couldn't get info for " + username);
                });

          } else {
            cb("User " + username + " already exists");
          }
        },
        function (err) {
          cb(err);
        });
  };

  /**
   * check the db to see if we have a record for this username
   * --> reject if no existing record exists
   *     then go get the name/id for this logged in user
   * (validates login, gives us the name/id info
   * --> reject if fails
   * encrypt the password
   * update the record in our backend database
   * return success
   */
  Member.updateMember = function (username, password, id, cb) {
    if (!id) {
      cb('Not authenticated.  Login first.');
      return;
    }


    Member.Promise.findById(id)
      .then(function (record) {
          console.log("Found user! " + JSON.stringify(record));

          // validate these credentials
          var teetime = new TeeTimeAPI();

          teetime.login(username, password)
            .then(function (result) {
              // successful login
              return teetime.memberInfo();
            })
            .then(function (result) {
                // result of info() call
                console.log("Member info: " + JSON.stringify(result));

                updateMemberRecord(record, username, password, result);

                // update the backend database
                Member.Promise.update(record)
                  .then(function (record) {
                      cb(null, record);
                    },
                    function (err) {
                      cb(err);
                    });
              },
              function (err) {
                cb("Couldn't validate user credentials for " + username);
              });
        },
        function (err) {
          var str = "Error!" + JSON.stringify(err);
          cb(str);
        });
  };

  /**
   *     go get this record from the back end db
   * no record? --> fail
   * validate the username/password match
   * --> fail if false
   * create a username to represent this user
   * save this user's info??
   * return the token for future invocations
   */
  Member.login = function (username, password, cb) {

    console.log("login attempt for user " + username);

    Member.Promise.findByUsername(username)
      .then(function (record) {
          if (record != null) {

            var user = userCredentialsFromRecord(record);

            if (password != user.password) {
              cb("Invalid login credentials");
              return;
            }

            var User = app.models.User;

            User.login({
              username: username,
              password: password
            }, "user", function (loginErr, loginToken) {
              if (loginErr)
                return cb(loginErr);

              console.log("Login successful!");
              
              // If we got to this point, the login call was successful and we
              // now have access to the token generated by the login function.
              return cb(null, loginToken.toObject());

            });

          } else {
            cb("User " + username + " not found");
          }
        },
        function (err) {
          cb(err);
        });

  };

  Member.logout = function (tokenId, cb) {
    console.log(tokenId);

    // validated credentials, dynamically create a new user based on this

    var User = app.models.User;

    User.logout(tokenId, cb);

  };

  Member.search = function (lastname, id, cb) {

    if (!id) {
      cb('Not authenticated.  Login first.');
      return;
    }

    Member.Promise.findById(id)
      .then(function (record) {
          console.log("Got a response! " + JSON.stringify(record));

          var user = userCredentialsFromRecord(record);

          // go look for additional info
          var teetime = new TeeTimeAPI();

          teetime.login(user.username, user.password)
            .then(function (result) {
              return teetime.memberSearch(lastname);
            })
            .then(function (result) {
                // result of search
                cb(null, result);
              },
              function (err) {
                cb(err);
              });
        },
        function (err) {
          var str = "Error!" + JSON.stringify(err);
          cb(str);
        });
  };

};
//
// this represents the specifics of the reservation, tee time, course 
// preferences, other players in the foursome. It also knows the rules
// for when the tee sheet opens, 3 days before the booked tee time.
// 

var Member = function(userid, password) {

  this.getUserid = function() {
    return userid;
  };

  this.getPassword = function() {
    return password;
  };

};

module.exports = Member;

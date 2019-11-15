const Formatter = {

  /**
   * pretty print the date and time for this tee time
   *
   * @param {String} teetime ISO string representing the tee time
   */
  teeTime(teetime) {
    const date = new Date(teetime);

    const dateOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    };

    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    };

    return {
      date: date.toLocaleDateString("en-US", dateOptions),
      time: date.toLocaleTimeString("en-US", timeOptions)
    };
  },

  courses(courses) {
    let courseText = (courses.length > 0)
      ? courses[0]
      : "";

    for (var i = 1; i < courses.length; i++) {
      courseText += ", " + courses[i];
    }

    return courseText;
  },

  golfers(owner, golfers) {
    let golferText = owner; // reservation owner is always the first golfer

    for (var i = 0; i < golfers.length; i++) {
      golferText += ", " + golfers[i];
    }

    return golferText;
  }

};

export default Formatter;
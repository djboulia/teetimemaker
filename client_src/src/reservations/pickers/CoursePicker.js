import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = {
  courseVisible: {
    opacity: '1.0',
    boxSizing: 'border-box',
    transition: 'height 250ms 0ms, opacity 250ms 250ms'
  },

  courseHide: {
    border: 'solid 1px #2bbbad',
    transition: 'height 250ms 250ms, opacity 250ms 0ms',
    opacity: '0.0',
    height: '0px'
  },

  courseShow: {
    border: 'solid 1px #2bbbad',
    boxSizing: 'border-box',
    transition: 'height 250ms 0ms, opacity 250ms 250ms'
  }
}

/**
* return a human readable version of the sort order
*/
const order = function (selected, index) {
  let val = "";

  if (selected) {
    switch (index) {
      case 0:
        val = "1st";
        break;
      case 1:
        val = "2nd";
        break;
      case 2:
        val = "3rd";
        break;
      default:
        val = "";
    }
  }

  return val;
}

/**
 * return an array of selected course names
 */
const selectedCourses = function (courses) {
  const selected = [];

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    if (course.selected === true) {
      selected.push(course.name);
    }
  }

  return selected;
}


export default function CoursePicker(props) {
  const [courseChange, setCourseChange] = React.useState(false);
  const [courses, setCourses] = React.useState([
    {
      key: "fairways",
      name: "Fairways",
      selected: false,
      added: false,
      removed: false,
    }, {
      key: "highlands",
      name: "Highlands",
      selected: false,
      added: false,
      removed: false,
    }, {
      key: "meadows",
      name: "Meadows",
      selected: false,
      added: false,
      removed: false,
    }
  ]);

  const transitionTime = 250; // ms

  const handleChange = function (event) {

    // initially mark the element to be removed from the list
    const value = event.target.value;
    const newCourses = [];

    console.log("changed! " + value);

    // copy course data
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];

      if (course.key === value) {
        course.selected = !course.selected;
        course.removed = true;
        course.added = false;
      }

      newCourses.push(course);
    }

    setCourses(newCourses);

    setTimeout(() => {
      console.log("removing item " + value);

      setTimeout(
        () => showChange(value), transitionTime
      )
    }, transitionTime);

  }

  const showChange = function (value) {
    console.log("showing item " + value);

    const newCourses = [];
    for (let i = 0; i < courses.length; i++) {
      newCourses.push(courses[i]);
    }

    for (let i = 0; i < newCourses.length; i++) {
      const course = newCourses[i];

      if (course.key === value) {
        course.added = true;
        course.removed = false;

        // de-selected entries sink to the bottom
        newCourses.splice(i, 1);

        let j;

        for (j = 0; j < newCourses.length; j++) {
          const course2 = newCourses[j];

          if (!course2.selected) {
            break;
          }
        }

        newCourses.splice(j, 0, course);

        break;
      }
    }

    setCourses(newCourses);

    setTimeout(() => completeChange(value), transitionTime)
  }

  const completeChange = function (value) {
    console.log("showing item " + value);

    const newCourses = [];
    for (let i = 0; i < courses.length; i++) {
      newCourses.push(courses[i]);
    }

    for (let i = 0; i < newCourses.length; i++) {
      const course = newCourses[i];

      if (course.key === value) {
        course.added = false;
        course.removed = false;

        // de-selected entries sink to the bottom
        newCourses.splice(i, 1);

        let j;

        for (j = 0; j < newCourses.length; j++) {
          const course2 = newCourses[j];

          if (!course2.selected) {
            break;
          }
        }

        newCourses.splice(j, 0, course);

        break;
      }
    }

    setCourseChange(!courseChange); // toggle course change to trigger a change event
    setCourses(newCourses);
  }

  /**
   * fire change events when course list changes
   */
  React.useEffect(() => {
    console.log("CoursePicker.useEffect: ", courses);
    if (props.onChange) {
      props.onChange(selectedCourses(courses));
    }
  }, [courseChange])

  console.log("CoursePicker: render");

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Include</TableCell>
          <TableCell>Course</TableCell>
          <TableCell>Preference</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {courses
          .map(function (course, index) {
            let rowClass = course.removed ? styles.courseHide : course.added ? styles.courseShow : styles.courseVisible;

            return <TableRow key={course.key} style={rowClass}>
              <TableCell>
                <Checkbox
                  name='group1'
                  onChange={handleChange}
                  value={course.key}
                  color="secondary"
                  checked={course.selected}
                  label=' ' />
              </TableCell>

              <TableCell>
                {course.name}
              </TableCell>

              <TableCell>
                {order(course.selected, index)}
              </TableCell>
            </TableRow>

          })}
      </TableBody>
    </Table>

  );
}

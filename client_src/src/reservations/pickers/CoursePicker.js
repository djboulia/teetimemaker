import React, { Component } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const courseVisible = {
  opacity: '1.0',
  boxSizing: 'border-box',
  transition: 'height 250ms 0ms, opacity 250ms 250ms'
};

const courseHide = {
  border: 'solid 1px #2bbbad',
  transition: 'height 250ms 250ms, opacity 250ms 0ms',
  opacity: '0.0',
  height: '0px'
}

const courseShow = {
  border: 'solid 1px #2bbbad',
  boxSizing: 'border-box',
  transition: 'height 250ms 0ms, opacity 250ms 250ms'
}



class CoursePicker extends Component {

  constructor(props) {
    super(props);

    this.handleChange = this
      .handleChange
      .bind(this);

    this.transitionTime = 250; // ms

    this.state = {
      courses: [
        {
          key: "fairways",
          name: "Fairways",
          selected: false,
          added: false,
          removed: false,
          handleChange: this.handleChange
        }, {
          key: "highlands",
          name: "Highlands",
          selected: false,
          added: false,
          removed: false,
          handleChange: this.handleChange
        }, {
          key: "meadows",
          name: "Meadows",
          selected: false,
          added: false,
          removed: false,
          handleChange: this.handleChange
        }
      ]
    };

  }

  handleChange(event) {

    // initially mark the element to be removed from the list
    let value = event.target.value;
    let courses = this.state.courses;

    console.log("changed! " + value);
    let i = 0;

    for (i = 0; i < courses.length; i++) {
      let course = courses[i];

      if (course.key === value) {
        course.selected = !course.selected;
        course.removed = true;
        course.added = false;

        break;
      }
    }

    setTimeout(() => this.setState(() => {
      console.log("removing item " + value);
      setTimeout(() => this.showChange(value), this.transitionTime)
      return { courses: courses };
    }), 250);

  }

  showChange(value) {
    console.log("showing item " + value);

    let courses = this.state.courses;
    let i = 0;

    for (i = 0; i < courses.length; i++) {
      let course = courses[i];

      if (course.key === value) {
        course.added = true;
        course.removed = false;

        // de-selected entries sink to the bottom
        courses.splice(i, 1);

        let j;

        for (j = 0; j < courses.length; j++) {
          let course2 = courses[j];

          if (!course2.selected) {
            break;
          }
        }

        courses.splice(j, 0, course);

        break;
      }
    }

    this.setState(() => {
      setTimeout(() => this.completeChange(value), this.transitionTime)
      return { courses: courses };
    });

  }

  completeChange(value) {
    console.log("showing item " + value);

    let courses = this.state.courses;
    let i = 0;

    for (i = 0; i < courses.length; i++) {
      let course = courses[i];

      if (course.key === value) {
        course.added = false;
        course.removed = false;

        // de-selected entries sink to the bottom
        courses.splice(i, 1);

        let j;

        for (j = 0; j < courses.length; j++) {
          let course2 = courses[j];

          if (!course2.selected) {
            break;
          }
        }

        courses.splice(j, 0, course);

        break;
      }
    }

    this.stateChange({ courses: courses });
  }

  /**
   * funnel all state changes through this method so that 
   * we fire an appropriate onChange event when state changes
   * 
   * @param {*} state new state to set
   */
  stateChange(state) {
    this.setState(state, () => {
      if (this.props.onChange) {
        this.props.onChange(this.selectedCourses());
      }
    });
  }

  /**
   * return an array of selected course names
   */
  selectedCourses() {
    const courses = this.state.courses;
    const selected = [];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      if (course.selected === true) {
        selected.push(course.name);
      }
    }

    return selected;
  }

  /**
   * return a human readable version of the sort order
   */
  order(selected, index) {
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

  render() {
    console.log("CoursePicker: render");

    let courses = this.state.courses;
    let order = this.order;

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
              let rowClass = course.removed ? courseHide : course.added ? courseShow : courseVisible;

              return <TableRow key={course.key} style={rowClass}>
                <TableCell>
                  <Checkbox
                    name='group1'
                    onChange={course.handleChange}
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

    )
  }
}

export default CoursePicker;
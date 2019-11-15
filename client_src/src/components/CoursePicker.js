import React, {Component} from 'react';
import {Checkbox, Table} from 'react-materialize';
import '../App.css';

class CoursePicker extends Component {

  constructor(props) {
    super(props);

    this.handleChange = this
      .handleChange
      .bind(this);

    this.transitionTime = 200; // ms

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
      setTimeout(()=> this.showChange(value), this.transitionTime)
      return {courses: courses};
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
      setTimeout(()=> this.completeChange(value), this.transitionTime)
      return {courses: courses};
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

    this.stateChange({courses: courses});
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

    for (let i=0; i<courses.length; i++) {
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
    let classes = 'course';
    let classesHide = 'course remove';
    let classesShow = 'course add';

    return (
      <div>

        <Table>
          <thead>
            <tr>
              <th data-field="id">Include</th>
              <th data-field="name">Course</th>
              <th data-field="price">Preference</th>
            </tr>
          </thead>

          <tbody>

            {courses
              .map(function (course, index) {
                let rowClass = course.removed ? classesHide : course.added ? classesShow : classes;

                return <tr key={course.key} className={rowClass}>
                  <td>
                    <Checkbox
                      name='group1'
                      onChange={course.handleChange}
                      value={course.key}
                      checked={course.selected}
                      label=' '/>
                  </td>
                  <td>{course.name}</td>
                  <td>{order(course.selected, index)}</td>
                </tr>

              })}

          </tbody>
        </Table>

      </div>
    )
  }
}

export default CoursePicker;
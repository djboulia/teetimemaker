import React, {Component} from 'react';
import {Icon, Navbar, NavItem, SideNav, SideNavItem} from 'react-materialize';
import Server from './Server';

class Nav extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn : Server.isLoggedIn()
    }


    this.sideNavClicked = this
      .sideNavClicked
      .bind(this);
    
  }

  /**
   * Update the menu state when the side nav is clicked
   * This way we can trigger state updates when login/logout changes
   * 
   * @param {Object} e click event
   */
  sideNavClicked(e) {
    console.log("menu clicked");

    if (this.state.loggedIn !== Server.isLoggedIn()) {
      this.setState( {loggedIn : Server.isLoggedIn()});
    }
  }

  render() {

    // logout link only works when the user is correctly 
    // logged in
    const logoutLink = this.state.loggedIn
      ? <SideNavItem waves href='/logout'><Icon className="fa fa-sign-out">&nbsp;</Icon>Logout</SideNavItem>     
      : <SideNavItem subheader><Icon className="fa fa-sign-out">&nbsp;</Icon>Logout</SideNavItem>


    return (
      // <div>
      //   <nav className="blue darken-3">
      //     <div className="nav-wrapper">
      //       <a href="/reservations" className=" brand - logo center ">Tee Time Maker</a>
      //       <a data-activates="main-menu" className="button-collapse show-on-large">
      //         <i className="fa fa-bars"></i>
      //       </a>
      //       <ul className="right hide-on-small-only">
      //         <li>
      //           <Link to="/reservations">
      //             < i className="fa fa-clock-o"></i>
      //             Reservations
      //           </Link>
      //         </li>
      //       </ul>
      //       < ul className="side-nav" id="main-menu">
      //         <li>
      //           <Link to="/reservations">
      //             <i className="fa fa-clock-o"></i>
      //             Reservations</Link>
      //         </li>
      //         < li >
      //           <Link to="/reservations/add">
      //             <i className="fa fa-plus"></i>
      //             Add Reservation</Link>
      //         </li>
      //         <li>
      //           <Link to="/about">
      //             < i className="fa fa-question-circle"></i>
      //             About
      //           </Link>
      //         </li>
      //         {logoutLink}
      //       </ul>
      //     </div >
      //   </nav>
      // </div>


      <Navbar className="blue darken-3" alignLinks="left">

        <SideNav
          trigger={<a href="#" 
          onClick={this.sideNavClicked}><Icon className="fa fa-bars">&nbsp;</Icon></a>}
          options={{ closeOnClick: true }}
        >

          <SideNavItem href='/reservations'>
            <Icon className="fa fa-clock-o">&nbsp;</Icon>
            Reservations
          </SideNavItem>

          <SideNavItem href='/reservations/add'>
            <Icon className="fa fa-plus">&nbsp;</Icon>
            Add Reservation
          </SideNavItem>

          <SideNavItem href='/about'>
            <Icon className="fa fa-question-circle">&nbsp;</Icon>
            About
          </SideNavItem>

          <SideNavItem divider />

          {logoutLink}

        </SideNav>
     
        <NavItem href='/reservations'>Tee Time Maker</NavItem>

      </Navbar>

    )
  }
}

export default Nav;
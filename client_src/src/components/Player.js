import React, {Component} from 'react';
import {Button, TextInput, Select, Modal, Row, Collection, CollectionItem} from 'react-materialize';
import '../App.css';

class PlayerSearch {
  constructor(text) {
    this.text = text;
    this.canceled = false;
    this.cb = null;

    // just make up some results for now
    this.results = [ 
      { id: "0001", name: "Don Boulia" },
      { id: "3456", name: "Kirsten Boulia" },
      { id: "1234", name: "Carter Boulia" },
      { id: "5678", name: "Lauren Boulia" },
      { id: "9012", name: "Ryder Boulia" },
      { id: "000123", name: "Mike Perhay" },
      { id: "000456", name: "Aundrea Perhay" }
    ]

    this.tick = this.tick.bind(this);
  
  }

  cancel() {
    this.cb = null;
    console.log("player search canceled");
  }

  doSearch(cb) {
    this.cb = cb;

    // just put in a delay for now, but eventually this will
    // kick off a call to the web back end
    this.timer = setTimeout(this.tick, 1000);
  }

  tick() {
    if (this.cb) {
      let results = [];

      for (let i=0; i<this.results.length; i++) {
        let result = this.results[i];

        if (result.name.toLowerCase().indexOf(this.text.toLowerCase()) >=0) {
          results.push(result);
        }
      }

      this.cb(results);
    }
  }
}

let defaultSearchState = function() {
  return {
    searchtext: "",
    results: [],
    selected: ""
  };
}

class Player extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search: defaultSearchState(),
      currentSearch: null
    }

    this.handleSelectionChanged = this
      .handleSelectionChanged
      .bind(this);

      this.handleModalClosed = this
      .handleModalClosed
      .bind(this);

      this.handleModalReset = this
      .handleModalReset
      .bind(this);

    this.handleModalInputChanged = this
      .handleModalInputChanged
      .bind(this);

    this.handleItemClicked = this
      .handleItemClicked
      .bind(this);

    this.searchComplete = this
      .searchComplete
      .bind(this);
  }

  searchComplete(results) {
    let search = this.state.search;
    search.results = results;

    this.setState({search: search, currentSearch: null});
  }

  handleSelectionChanged(e) {
    console.log("Player: selection changed");

    if (this.props.onChange) {
      this
      .props
      .onChange(e);
    }
  }

  handleModalClosed() {
    console.log("Player: modal closed");
    let search = this.state.search;

    console.log("Player: search " + JSON.stringify(search));
    let player = null;

    if (search.selected && this.props.onChangeSearch) {

      for (let i=0; i<search.results.length; i++) {
        let result = search.results[i];
        if (result.id === search.selected) {
          player = result;
        }
      }

      this.props.onChangeSearch(player);
    }

    this.handleModalReset();
  }

  handleModalReset() {
    console.log("Player: modal search reset");

    // reset the search state for next time
    this.setState({search: defaultSearchState()});
  }

  handleModalInputChanged(e) {
    console.log("Player: input changed " + e.target.value);

    let search = this.state.search;
    console.log("Player: search " + JSON.stringify(search));

    search[e.target.id] = e.target.value;

    let currentSearch = this.state.currentSearch;
    if (currentSearch) {  // cancel in progress search before doing a new one
      currentSearch.cancel();
    }

    currentSearch = new PlayerSearch(e.target.value);
    currentSearch.doSearch(this.searchComplete);

    this.setState({search: search, currentSearch: currentSearch});

  }

  createSelectItems() {
    let items = [];

    if (!this.props.self) {
      for (let i = 0; i < this.props.choices.length; i++) {
        var choice = this.props.choices[i];

        items.push(
          <option key={i} value={choice.id}>{choice.name}</option>
        );
      }
    }

    return items;
  }

  handleItemClicked(e) {
    console.log("Player: item clicked " + e.target.id);
    let search = this.state.search;
    search.selected = e.target.id;

    this.setState( {search: search} );

    return true;
  }

  createSearchResults() {
    let items = [];
    let search = this.state.search;

    for (let i = 0; i < search.results.length; i++) {
      var item = search.results[i];

      if (search.selected === item.id) {
        items.push(
          <CollectionItem 
            key={i} 
            id={item.id} 
            onClick={this.handleItemClicked} 
            className='active'>
              {item.name}
          </CollectionItem>
        );
  
      } else {
        items.push(
          <CollectionItem 
            key={i} 
            id={item.id} 
            onClick={this.handleItemClicked}>
              {item.name}
          </CollectionItem>
        );
        }
    }

    return items;
  }

  render() {
    console.log("Player: render defaultValue " + JSON.stringify(this.props.defaultValue));
    console.log("choices " + JSON.stringify(this.props.choices));

    let input = null;
    let defaultValue = (this.props.defaultValue) ? this.props.defaultValue.id : '';

    if (this.props.self) {
      input = (
        <div>
          <TextInput s={6} id={this.props.id} type="text" defaultValue={this.props.name} 
                onChange={this.handleModalInputChanged} disabled/>
        </div>
      )

    } else {

      // editable input field has select-able options and a search button
      input = (
        <div>
          <Select
            s={6}
            id={this.props.id}
            value={defaultValue}
            onChange={this.handleSelectionChanged}>
            {this.createSelectItems()}
          </Select>

          <div className="col input-field s6">
            <Modal
              header='Search for Players'
              fixedFooter
              trigger={< Button >Search...</Button>}
              actions={< div > <Button modal="close" waves="light" onClick={this.handleModalClosed}>OK</Button> < Button modal = "close" waves = "light"  onClick={this.handleModalReset} className = "red darken-2" > Cancel </Button> </div >}>
              <p>Type the name of the member to search for:</p>

              <TextInput
                s={6}
                id={"searchtext"}
                placeholder="Type Last Name Here"
                value={this.state.search.searchtext}
                onChange={this.handleModalInputChanged}>
              </TextInput>

              <Collection
                id={"searchresults"}>
                {this.createSearchResults()}
              </Collection>
            </Modal>
          </div>
        </div>
      )
    }

    return (
      <Row>
        {input}
      </Row>
    )
  }
}

export default Player;
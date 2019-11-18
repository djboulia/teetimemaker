import React, {Component} from 'react';
import {Button, TextInput, Modal, Collection, CollectionItem} from 'react-materialize';
import Server from './Server';
import '../App.css';

class PlayerSearch {
  constructor(text) {
    this.text = text;
    this.canceled = false;
  }

  cancel() {
    this.cb = null;
    console.log("player search canceled");
  }

  doSearch(cb) {

    Server.memberSearch(this.text)
    .then((results) => {
      cb(results);
    })
    .catch((e) => {
      console.log("error on search: " + JSON.stringify(e));
    })

  }
}

let defaultSearchState = function() {
  return {
    searchtext: "",
    results: [],
    selected: undefined
  };
}

/**
 * props:
 *  onClose - function - if provided, will be called with the result of the search
 */
class PlayerSearchModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search: defaultSearchState(),
      currentSearch: null
    }

    this.searchComplete = this
      .searchComplete
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

  }

  searchComplete(results) {
    console.log("searchComplete: results: " + JSON.stringify(results));

    let search = this.state.search;
    search.results = results;
    search.selected = undefined;  // new search result -- remove any current selection

    this.setState({search: search, currentSearch: null});
  }

  handleModalClosed() {
    console.log("Player: modal closed");
    let search = this.state.search;

    console.log("Player: search " + JSON.stringify(search));
    let player = null;

    if (search.selected && this.props.onClose) {

      for (let i=0; i<search.results.length; i++) {
        let result = search.results[i];
        if (result.id === search.selected) {
          player = result;
        }
      }

      if (player) {
        this.props.onClose(player);
      }

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

  handleItemClicked(e) {
    console.log("Player: item clicked " + e.target.id);
    let search = this.state.search;
    search.selected = Number.parseInt(e.target.id);

    this.setState( {search: search} );

    return true;
  }

  createSearchResults() {
    const items = [];
    const search = this.state.search;
    const currentSearch = this.state.currentSearch;


    if (currentSearch) {
      // search in progress, indicate that to the user
      items.push(
        <CollectionItem 
          key={0} 
          id={0}>
            {"Searching..."}
        </CollectionItem>
      );
    } else if (search.results.length ===0) {
      // search complete, no results
      items.push(
        <CollectionItem 
          key={0} 
          id={0}
          disabled="true">
            {"No results"}
        </CollectionItem>
      );
    } else {
      // display search results
      for (let i = 0; i < search.results.length; i++) {
        var item = search.results[i];
  
        if (search.selected === item.id) {
          console.log("setting id to selected " + item.id);
  
          items.push(
            <CollectionItem 
              key={i} 
              id={item.id.toString()} 
              onClick={this.handleItemClicked} 
              className='active'>
                {item.name}
            </CollectionItem>
          );
    
        } else {
          items.push(
            <CollectionItem 
              key={i} 
              id={item.id.toString()} 
              onClick={this.handleItemClicked}>
                {item.name}
            </CollectionItem>
          );
          }
      }  
    }

    return(
    <Collection
      id={"searchresults"}>
        {items}
    </Collection>);
  }

  render() {

    // ok button disabled until we make a selection 
    const disabled = this.state.search.selected ? false : true;

    return(
      <div className="col input-field s6">
      <Modal
        header='Search for Players'
        fixedFooter
        trigger={< Button >Search...</Button>}
        actions={< div > <Button modal="close" disabled={disabled} waves="light" onClick={this.handleModalClosed}>OK</Button> < Button modal = "close" waves = "light"  onClick={this.handleModalReset} className = "red darken-2" > Cancel </Button> </div >}>
        <p>Type the name of the member to search for:</p>
  
        <TextInput
          s={6}
          id={"searchtext"}
          placeholder="Type Last Name Here"
          value={this.state.search.searchtext}
          onChange={this.handleModalInputChanged}>
        </TextInput>
  
          {this.createSearchResults()}

      </Modal>
    </div>
    );


  }
}

export default PlayerSearchModal;
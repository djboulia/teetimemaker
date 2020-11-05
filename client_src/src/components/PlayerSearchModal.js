import React, {Component} from 'react';
import {Button, TextInput, Row, Modal, Collection, CollectionItem} from 'react-materialize';
import Server from '../utils/Server';
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

/**
 * props:
 *  searchResults - array - the search results to display in the modal
 *  onSearchResults - function - if provided, will be called when a new search completes
 *  onClose - function - if provided, will be called with the player selected
 */
class PlayerSearchModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search: {
        searchtext: "",
        selected: undefined
      },
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

      this.handleSearch = this
      .handleSearch
      .bind(this);

    this.handleItemClicked = this
      .handleItemClicked
      .bind(this);

  }

  componentDidMount() {
    console.log("componentDidMount");
  }

  searchComplete(results) {
    console.log("searchComplete: results: " + JSON.stringify(results));

    // notify the parent when search results change
    if (this.props.onSearchResults) {
      this.props.onSearchResults(results);
    }

    let search = this.state.search;
    search.selected = undefined;  // new search result -- remove any current selection

    this.setState({search: search, currentSearch: null});
  }

  handleModalClosed() {
    console.log("Player: modal closed");
    let search = this.state.search;
    const searchResults = this.props.searchResults;

    console.log("Player: search " + JSON.stringify(search));
    let player = null;

    if (search.selected && this.props.onClose) {

      for (let i=0; i<searchResults.length; i++) {
        let result = searchResults[i];
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
    const search = this.state.search;
    search.searchtext = "";
    search.selected = undefined;

    this.setState({search: search});
    console.log("PlayerSearchModal: modal reset ");
  }

  handleModalInputChanged(e) {
    console.log("Player: input changed " + e.target.value);

    let search = this.state.search;
    console.log("Player: search " + JSON.stringify(search));
    search.searchtext = e.target.value;

    this.setState({ "search" : search });
  }

  handleSearch(e) {
    this.fireSearch();
  }

  fireSearch() {
    let search = this.state.search;
    console.log("Player: search " + JSON.stringify(search));

    let currentSearch = this.state.currentSearch;
    if (currentSearch) {  // cancel in progress search before doing a new one
      currentSearch.cancel();
    }

    currentSearch = new PlayerSearch(search.searchtext);
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

  /**
   * NOTE: the search modal relies completely on the parent to provide it the search
   *       results.  this.props.SearchResults is set by the parent to populate the search
   *       list.  Even when a search is performed in this component, it calls the parent's
   *       onSearchResult handler with the new search result.  The parent can then decide
   *       what to change by changing the properties passed into this component.
   */
  createSearchResults() {
    const items = [];
    const search = this.state.search;
    const searchResults = this.props.searchResults;
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
    } else if (!searchResults || searchResults.length ===0) {
      // search complete, no results
      items.push(
        <CollectionItem 
          key={0} 
          id={0}>
            {"No results"}
        </CollectionItem>
      );
    } else {
      // display search results
      for (let i = 0; i < searchResults.length; i++) {
        var item = searchResults[i];
  
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
    const okDisabled = this.state.search.selected ? false : true;
    const searchDisabled = this.state.search.searchtext !== "" ? false : true;

    return(
      <div className="col input-field s6">
      <Modal
        header='Search for Players'
        fixedFooter
        trigger={<Button >Search...</Button>}
        actions={<Row> 
                    <Button 
                      modal="close" 
                      disabled={okDisabled} 
                      waves="light" 
                      onClick={this.handleModalClosed}>
                        OK
                    </Button>

                    <span className="spacer"></span>

                    <Button 
                      modal = "close" 
                      waves = "light"  
                      onClick={this.handleModalReset} 
                      className = "red darken-2" > 
                        Cancel 
                    </Button> 
                  </Row>}>
        <p>Type the name of the member to search for:</p>
  
        <Row>
          <TextInput
            s={6}
            id={"searchtext"}
            placeholder="Type Last Name Here"
            value={this.state.search.searchtext}
            onChange={this.handleModalInputChanged}>
          </TextInput>

          <Button 
            onClick={this.handleSearch}
            disabled={searchDisabled}>
              Search
          </Button>
        </Row>

        {this.createSearchResults()}

      </Modal>
    </div>
    );


  }
}

export default PlayerSearchModal;
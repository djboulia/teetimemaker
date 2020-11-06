import React, { Component } from 'react';
import { Button, TextInput, Row, Modal, Collection, CollectionItem } from 'react-materialize';
import '../App.css';


/**
 * props:
 *  searchResults - array - the search results to display in the modal
 *  searchInProgress - boolean - true if a search is underway
 *  onSearch - function - if provided, will be called to fire a new search
 *  onClose - function - if provided, will be called with the player selected from the search dialgo
 */
class PlayerSearchModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      search: {
        searchtext: "",
        selected: undefined
      }
    }

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

  handleModalClosed() {
    console.log("Player: modal closed");
    let search = this.state.search;
    const searchResults = this.props.searchResults;

    console.log("Player: search " + JSON.stringify(search));
    let player = null;

    if (search.selected && this.props.onClose) {

      for (let i = 0; i < searchResults.length; i++) {
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

    this.setState({ search: search });
    console.log("PlayerSearchModal: modal reset ");
  }

  handleModalInputChanged(e) {
    console.log("Player: input changed " + e.target.value);

    let search = this.state.search;
    console.log("Player: search " + JSON.stringify(search));
    search.searchtext = e.target.value;

    this.setState({ "search": search });
  }

  /**
   * Call the provided search handler from the parent component to perform a search
   * The parent will update props.searchInProgress and props.searchResults to
   * indicate start and completion of the search
   * 
   * @param {Object} e 
   */
  handleSearch(e) {
    let search = this.state.search;
    console.log("Player: search " + JSON.stringify(search));

    if (this.props.onSearch) {
      this.props.onSearch(search.searchtext);
    }

    search.selected = undefined;  // new search -- remove any current selection

    this.setState({ search: search });
  }

  handleItemClicked(e) {
    console.log("Player: item clicked " + e.target.id);
    let search = this.state.search;
    search.selected = Number.parseInt(e.target.id);

    this.setState({ search: search });

    return true;
  }

  /**
   * the search modal relies  on the parent to provide it the search
   * results.  this.props.SearchResults is set by the parent to populate the results
   */
  createSearchResults() {
    const items = [];
    const search = this.state.search;
    const searchInProgress = this.props.searchInProgress;
    const searchResults = this.props.searchResults;

    if (searchInProgress) {
      // search in progress, indicate that to the user
      items.push(
        <CollectionItem
          key={0}
          id={0}>
          {"Searching..."}
        </CollectionItem>
      );
    } else if (!searchResults || searchResults.length === 0) {
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

    return (
      <Collection
        id={"searchresults"}>
        {items}
      </Collection>);
  }

  render() {

    // ok button disabled until we make a selection 
    const okDisabled = this.state.search.selected ? false : true;
    const searchDisabled = this.state.search.searchtext !== "" ? false : true;

    return (
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
              modal="close"
              waves="light"
              onClick={this.handleModalReset}
              className="red darken-2" >
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
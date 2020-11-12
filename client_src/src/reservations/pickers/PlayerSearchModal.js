import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Container, DialogActions, DialogContent, Grid, List, ListItem, TextField } from '@material-ui/core';

// import { Button, TextInput, Row, Modal, Collection, CollectionItem } from 'react-materialize';


/**
 * props:
 *  searchResults - array - the search results to display in the modal
 *  searchInProgress - boolean - true if a search is underway
 *  onSearch - function - if provided, will be called to fire a new search
 *  onClose - function - if provided, will be called with the player selected from the search dialgo
 */
export default function PlayerSearchModal(props) {
  const [open, setOpen] = React.useState(false);
  const [searchtext, setSearchtext] = React.useState("");
  const [selected, setSelected] = React.useState(undefined);

  // ok button disabled until we make a selection 
  const okDisabled = selected ? false : true;
  const searchDisabled = searchtext !== "" ? false : true;

  const handleModalOpen = function () {
    setOpen(true);
  }

  const handleModalClosed = function () {
    console.log("Player: modal closed");
    const searchResults = props.searchResults;

    console.log("Player: search " + searchtext + " , " + selected);
    let player = null;

    if (selected && props.onClose) {

      for (let i = 0; i < searchResults.length; i++) {
        let result = searchResults[i];
        if (result.id === selected) {
          player = result;
        }
      }

      if (player) {
        props.onClose(player);
      }

    }

    handleModalReset();
  }

  const handleModalReset = function () {
    setSearchtext("");
    setSelected(undefined);
    setOpen(false);

    console.log("PlayerSearchModal: modal reset ");
  }

  const handleModalInputChanged = function (e) {
    console.log("Player: input changed " + e.target.value);

    setSearchtext(e.target.value);
  }

  /**
   * Call the provided search handler from the parent component to perform a search
   * The parent will update props.searchInProgress and props.searchResults to
   * indicate start and completion of the search
   * 
   * @param {Object} e 
   */
  const handleSearch = function (e) {
    console.log("handleSearch ", e);

    if (props.onSearch) {
      props.onSearch(searchtext);
    }

    setSelected(undefined);
  }

  const handleItemClicked = function (e) {
    console.log("Player: item clicked " + e.target.id);

    const itemSelected = Number.parseInt(e.target.id);
    setSelected(itemSelected);

    return true;
  }

  /**
   * the search modal relies  on the parent to provide it the search
   * results.  props.SearchResults is set by the parent to populate the results
   */
  const createSearchResults = function () {
    const items = [];
    const searchInProgress = props.searchInProgress;
    const searchResults = props.searchResults;

    if (searchInProgress) {
      // search in progress, indicate that to the user
      items.push(
        <ListItem
          key="0">
          {"Searching..."}
        </ListItem>
      );
    } else if (!searchResults || searchResults.length === 0) {
      // search complete, no results
      items.push(
        <ListItem
          key="0">
          {"No results"}
        </ListItem>
      );
    } else {

      // display search results
      for (let i = 0; i < searchResults.length; i++) {
        var item = searchResults[i];

        if (selected === item.id) {
          console.log("setting id to selected " + item.id);

          items.push(
            <ListItem
              key={i}
              id={item.id.toString()}
              selected
              onClick={handleItemClicked}>
              {item.name}
            </ListItem>
          );

        } else {
          items.push(
            <ListItem
              key={i}
              id={item.id.toString()}
              onClick={handleItemClicked}>
              {item.name}
            </ListItem>
          );
        }

      }
    }

    return (
      <List
        style={{ minHeight: '200px', maxHeight: '200px', border: '1px solid #DDDDDD' }}
        id={"searchresults"}>
        {items}
      </List>);
  }

  return (

    <div>
      <Button variant="contained" color="secondary" onClick={handleModalOpen}>
        Search...
      </Button>

      <Dialog
        fullWidth={true}
        maxWidth="sm"
        aria-labelledby="simple-dialog-title"
        open={open}
      >
        <DialogTitle id="simple-dialog-title">Search for Players</DialogTitle>
        <Container maxWidth="lg" spacing={2}>

          <p>Type the name of the member to search for:</p>

          <Grid container alignContent="center" direction="row">
            <Grid item sm={6}>
              <TextField
                id={'searchtext'}
                placeholder={"Type Last Name Here"}
                value={searchtext}
                onChange={handleModalInputChanged}>
              </TextField>

            </Grid>
            <Grid item sm={6}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSearch}
                disabled={searchDisabled}>
                Search
                </Button>
            </Grid>
          </Grid>
        </Container>

        <DialogContent>
          {createSearchResults()}
        </DialogContent>

        <DialogActions>
          <Button variant="contained" onClick={handleModalReset}>Cancel</Button>
          <Button disabled={okDisabled} variant="contained" color="secondary" onClick={handleModalClosed}>OK</Button>
        </DialogActions>

      </Dialog>
    </div>
  );

}

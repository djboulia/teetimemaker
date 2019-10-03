import React from 'react';
import './App.css';
import Main from './components/Main';
import Nav from './components/Nav';

const App = () => (
  <div>
    <Nav />
    <div className="container">
      <Main />
    </div>
  </div>
)

export default App;

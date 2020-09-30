import React, { Component } from 'react';
import './App.css';

import logo from './resources/logo.png';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="Container">
            <img src={logo} className="App-logo" alt="logo" />
            <h3>Welcome to Kosher!</h3>
          </div>
        </header>
      </div>
    );
  }
}

export default App;


import React, { Component } from 'react';
import './App.css';
import Header from './components/header/Header';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header></Header>
        <div className='Content'>
        </div>
      </div>
    );
  }
}

export default App;

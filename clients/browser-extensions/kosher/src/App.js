import React, { Component } from 'react';
import './App.css';
import Header from './components/header/Header';
import Login from './screens/login/Login';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header></Header>
        <Login></Login>
      </div>
    );
  }
}

export default App;

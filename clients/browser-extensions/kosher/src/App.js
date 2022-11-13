import React, { Component } from 'react';
import './App.css';
import Header from './components/header/Header';
import Login from './screens/login/Login';
import Tabs from './screens/tabs/Tabs';
import SwitchComponents from './utils/navigation/ComponentSwitcher';

class App extends Component {
  constructor(props) {
    super(props);

    const initialScreen = "tabs";

    this.state = {
      activeScreen: initialScreen
    };
  }

  setActiveScreen(screen) {
    this.setState({
      activeScreen: screen
    });
  }

  render() {
    return (
      <div className="App">
        <Header></Header>
        <SwitchComponents active={this.state.activeScreen}>
          <Login name="login" setActiveScreen={this.setActiveScreen}></Login>
          <Tabs name="tabs" setActiveScreen={this.setActiveScreen}></Tabs>
        </SwitchComponents>
      </div>
    );
  }
}

export default App;

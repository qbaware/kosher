import React, { Component } from 'react';
import Header from './components/header/Header';
import Login from './screens/login/Login';
import Tabs from './screens/tabs/Tabs';
import SwitchComponents from './utils/navigation/ComponentSwitcher';
import Initial from './screens/initial/Initial';
import './App.css';

class App extends Component {
  static initialScreen = "initial";
  static loginScreen = "login";
  static tabsScreen = "tabs";

  constructor(props) {
    super(props);

    const initialScreen = App.initialScreen;

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
          <Initial name={App.initialScreen} setActiveScreen={this.setActiveScreen.bind(this)}></Initial>
          <Login name={App.loginScreen} setActiveScreen={this.setActiveScreen.bind(this)}></Login>
          <Tabs name={App.tabsScreen} setActiveScreen={this.setActiveScreen.bind(this)}></Tabs>
        </SwitchComponents>
      </div>
    );
  }
}

export default App;

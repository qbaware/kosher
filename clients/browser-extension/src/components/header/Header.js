import React, { Component } from 'react';
import './Header.css';
import logo from '../../resources/logo.png';
import NormalText from '../text/NormalText';
import KosherText from '../text/KosherText';
import { getCurrentBrowser } from '../../scripts/utils';

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      browser: ""
    };
  }

  componentDidMount() {
    this.setState({ browser: getCurrentBrowser() });
  }

  render() {
    return (
      <div className='HeaderContainer'>
        <header className="Header">
          <div className="Container">
            <img src={logo} className="Logo" alt="logo" />
            <h3>
              <NormalText text="kosher"></NormalText>
            </h3>
            <h3>
              <KosherText text={this.state.browser ? "for " + this.state.browser : "Unknown browser"}></KosherText>
            </h3>
          </div>
        </header>
      </div>
    );
  }
}

export default Header;

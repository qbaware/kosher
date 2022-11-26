import React, { Component } from 'react';
import './Header.css';
import logo from '../../resources/logo.png';
import NormalText from '../text/NormalText';
import KosherText from '../text/KosherText';

class Header extends Component {
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
              <KosherText text="for Chrome"></KosherText>
            </h3>
          </div>
        </header>
      </div>
    );
  }
}

export default Header;

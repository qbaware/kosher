import React, { Component } from 'react';
import './KosherText.css';

class KosherText extends Component {
  render() {
    return (
      <p className='KosherText'>{this.props.text}</p>
    );
  }
}

export default KosherText;

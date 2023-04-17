import React, { Component } from 'react';
import './NormalText.css';

class NormalText extends Component {
  render() {
    return (
      <p className='NormalText'>{this.props.text}</p>
    );
  }
}

export default NormalText;

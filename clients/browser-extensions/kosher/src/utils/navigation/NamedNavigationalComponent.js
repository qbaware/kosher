import { Component } from 'react';

export default class NamedNavigationalComponent extends Component {
  constructor(props) {
    super(props);

    this.name = props.name;
    this.setActiveScreen = props.setActiveScreen;
  }
}

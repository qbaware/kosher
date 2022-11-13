import React from 'react';
import NamedNavigationalComponent from '../../utils/navigation/NamedNavigationalComponent';
import './Tabs.css';

class Tabs extends NamedNavigationalComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="Tabs">
        <h3>Hi tabs!</h3>
      </div>
    );
  }
}

export default Tabs;

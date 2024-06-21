import React, { Component, ReactNode } from 'react';

import { Notification } from '@/components/Notification';

interface HexagonProps {
  notify?: boolean;
  children: ReactNode;
  big?: boolean;
}

class Hexagon extends Component<HexagonProps> {
  render() {
    return (
      <div className="relative">
        <div
          className={
            this.props.big === true ? 'big-hexagon hexagon' : 'hexagon'
          }
        >
          <div className="hexagon-content">{this.props.children}</div>
        </div>
        {this.props.notify && <Notification />}
      </div>
    );
  }
}

export default Hexagon;

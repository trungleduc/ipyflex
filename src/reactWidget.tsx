import React, { Component } from 'react';

interface IProps {
  send_msg: any;
  model: any;
}

interface IState {
  template: any;
}

export class FlexWidget extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  render(): JSX.Element {
    return <div>Hello from react</div>;
  }
}

export default FlexWidget;

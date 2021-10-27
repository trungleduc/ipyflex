import React, { Component } from 'react';

interface IProps {
  widget_idx: number;
  model: any;
}

interface IState {
  state: number;
}

export class WidgetWrapper extends Component<IProps, IState> {
  widget_idx: number;
  model: any;
  divId: string;
  myRef: any;
  constructor(props: IProps) {
    super(props);
    this.model = props.model;
    this.widget_idx = props.widget_idx;
    this.state = {
      state: 0,
    };
    this.myRef = React.createRef<HTMLElement>();
  }
  componentDidMount(): void {
    const children = this.model.get('children');
    const manager = this.model.widget_manager;
    manager
      .create_view(children[0], {})
      .then((view) => this.myRef.current.appendChild(view.pWidget.node));
  }

  render(): JSX.Element {
    return <div ref={this.myRef}></div>;
  }
}

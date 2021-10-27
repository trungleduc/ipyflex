import React, { Component } from 'react';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';
interface IProps {
  widget_name: string;
  model: any;
}

interface IState {
  state: number;
}

export class WidgetWrapper extends Component<IProps, IState> {
  widget_name: string;
  model: any;
  divId: string;
  myRef: any;
  constructor(props: IProps) {
    super(props);
    this.model = props.model;
    this.widget_name = props.widget_name;
    this.state = {
      state: 0,
    };
    this.myRef = React.createRef<HTMLElement>();
  }
  componentDidMount(): void {
    const children = this.model.get('children');
    const widgetModel = children[this.widget_name];
    const manager = this.model.widget_manager;
    manager.create_view(widgetModel, {}).then((view) => {
      MessageLoop.sendMessage(view.pWidget, Widget.Msg.BeforeAttach);
      this.myRef.current.insertBefore(view.pWidget.node, null);
      MessageLoop.sendMessage(view.pWidget, Widget.Msg.AfterAttach);
    });
  }

  render(): JSX.Element {
    return <div ref={this.myRef}></div>;
  }
}

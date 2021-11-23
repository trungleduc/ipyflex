import React, { Component } from 'react';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';
import { IDict } from './utils';
interface IProps {
  widgetName: string;
  model: any;
}

interface IState {
  state: number;
}

export class WidgetWrapper extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.model = props.model;
    this.model.listenTo(this.model, 'change:children', this.on_children_change);
    this.widgetName = props.widgetName;
    this.state = {
      state: 0,
    };
    this.myRef = React.createRef<HTMLDivElement>();
  }

  on_children_change = (model, newValue: IDict, change: IDict): void => {
    if (this.placeholder && this.widgetName in newValue) {
      this.myRef.current.firstChild.remove();
      this._render_widget(newValue[this.widgetName]);
      this.placeholder = false;
    }
  };

  private _render_widget = (model: any) => {
    const manager = this.model.widget_manager;
    manager.create_view(model, {}).then((view) => {
      MessageLoop.sendMessage(view.pWidget, Widget.Msg.BeforeAttach);
      this.myRef.current.insertBefore(view.pWidget.node, null);
      view.displayed.then(async () => {
        await new Promise((r) => setTimeout(r, 100));
        window.dispatchEvent(new Event('resize'));
      });
      MessageLoop.sendMessage(view.pWidget, Widget.Msg.AfterAttach);
    });
  };

  componentDidMount(): void {
    const children = this.model.get('children');

    const widgetModel = children[this.widgetName];

    if (widgetModel) {
      this._render_widget(widgetModel);
      this.placeholder = false;
    } else {
      const placeHolder = document.createElement('p');
      placeHolder.style.textAlign = 'center';
      placeHolder.style.padding = '20px';
      placeHolder.innerText = `Placeholder for ${this.widgetName} widget`;
      this.myRef.current.insertBefore(placeHolder, null);
      this.placeholder = true;
    }
  }

  render(): JSX.Element {
    return <div className="ipyflex-widget-box" ref={this.myRef}></div>;
  }

  private widgetName: string;
  private model: any;
  private myRef: React.RefObject<HTMLDivElement>;
  private placeholder: boolean;
}

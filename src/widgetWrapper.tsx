import React, { Component } from 'react';
import { MessageLoop } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';
import { IDict, MESSAGE_ACTION } from './utils';
import { unpack_models, uuid } from '@jupyter-widgets/base';
import { ContextMenu } from '@lumino/widgets';

interface IProps {
  widgetName: string;
  factoryDict: IDict<IDict>;
  model: any;
  send_msg: (args: { action: string; payload: any }) => void;
  extraData: IDict | undefined;
  contextMenu: ContextMenu;
}

interface IState {
  uuid: string;
}

export class WidgetWrapper extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.model = props.model;
    this.model.listenTo(this.model, 'change:children', this.on_children_change);
    this.model.listenTo(this.model, 'msg:custom', this.on_msg);
    this.widgetName = props.widgetName;
    this.state = {
      uuid: uuid()
    };
    this.myRef = React.createRef<HTMLDivElement>();
  }

  on_msg = (data: { action: string; payload: any }, buffer: any[]): void => {
    const { action, payload } = data;
    switch (action) {
      case MESSAGE_ACTION.RENDER_FACTORY: {
        const { model_id, uuid } = payload;
        if (uuid === this.state.uuid) {
          unpack_models(model_id, this.model.widget_manager).then(
            (wModel: any) => {
              this.myRef.current?.firstChild?.remove();
              this._render_widget(wModel);
            }
          );
        }
        break;
      }
      case MESSAGE_ACTION.RENDER_ERROR: {
        const { error_msg, uuid } = payload;
        if (uuid === this.state.uuid && this.myRef.current?.firstChild) {
          this.myRef.current.firstChild.textContent = error_msg;
        }
        break;
      }
      default:
        return;
    }
  };

  on_children_change = (model: any, newValue: IDict, change: IDict): void => {
    if (
      this.placeholder &&
      this.widgetName in newValue &&
      newValue[this.widgetName]
    ) {
      this.myRef.current?.firstChild?.remove();
      this._render_widget(newValue[this.widgetName]);
      this.placeholder = false;
    }
  };

  private _render_widget = (model: any) => {
    const manager = this.model.widget_manager;
    manager.create_view(model, {}).then((view: any) => {
      MessageLoop.sendMessage(view.luminoWidget, Widget.Msg.BeforeAttach);
      this.myRef.current?.insertBefore(view.luminoWidget.node, null);
      view.displayed.then(async () => {
        await new Promise(r => setTimeout(r, 100));
        window.dispatchEvent(new Event('resize'));
      });
      MessageLoop.sendMessage(view.luminoWidget, Widget.Msg.AfterAttach);
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
      if (this.widgetName in this.props.factoryDict) {
        placeHolder.innerText = `Creating widget from ${this.widgetName} factory, please wait.`;
        this.myRef.current?.insertBefore(placeHolder, null);
        const payload: IDict = {
          factory_name: this.widgetName,
          uuid: this.state.uuid
        };
        if (this.props.extraData) {
          payload['extraData'] = this.props.extraData;
        }
        this.props.send_msg({
          action: MESSAGE_ACTION.REQUEST_FACTORY,
          payload
        });
      } else {
        placeHolder.innerText = `Placeholder for ${this.widgetName} widget.`;
        this.myRef.current?.insertBefore(placeHolder, null);
        this.placeholder = true;
      }
    }
  }

  render(): JSX.Element {
    return (
      <div
        className="ipyflex-widget-box"
        ref={this.myRef}
        onContextMenu={event => {
          if (event.shiftKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          this.props.contextMenu.open(event.nativeEvent);
        }}
      ></div>
    );
  }

  private widgetName: string;
  private model: any;
  private myRef: React.RefObject<HTMLDivElement>;
  private placeholder?: boolean;
}

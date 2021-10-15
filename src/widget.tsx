// Copyright (c) Trung Le
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
  unpack_models,
} from '@jupyter-widgets/base';

// import { UUID } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import FlexWidget from './reactWidget';
import { MODULE_NAME, MODULE_VERSION } from './version';
import { MessageLoop } from '@lumino/messaging';
// Import the CSS
import '../css/widget.css';

export class FlexLayoutModel extends DOMWidgetModel {
  defaults() {
    return {
      ...super.defaults(),
      _model_name: FlexLayoutModel.model_name,
      _model_module: FlexLayoutModel.model_module,
      _model_module_version: FlexLayoutModel.model_module_version,
      _view_name: FlexLayoutModel.view_name,
      _view_module: FlexLayoutModel.view_module,
      _view_module_version: FlexLayoutModel.view_module_version,
      children: [],
      value: 'Hello World',
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    children: { deserialize: unpack_models as any },
    // Add any extra serializers here
  };

  /**
   * Public constructor
   */
  initialize(
    attributes: any,
    options: {
      model_id: string;
      comm?: any;
      widget_manager: any;
    }
  ): void {
    super.initialize(attributes, options);
    this.widget_manager.display_model(undefined as any, this, {});
  }

  static model_name = 'FlexLayoutModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'FlexLayoutView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

class WidgetWrapper extends ReactWidget {
  _send_msg: any;
  _model: any;
  constructor(send_msg: any, model: any) {
    super();
    this._send_msg = send_msg;
    this._model = model;
  }

  onResize = (msg: any) => {
    window.dispatchEvent(new Event('resize'));
  };

  render() {
    return <FlexWidget send_msg={this._send_msg} model={this._model} />;
  }
}

export class FlexLayoutView extends DOMWidgetView {
  render() {
    super.render();

    this.el.classList.add('custom-widget');

    const widget = new WidgetWrapper(this.send.bind(this), this.model);
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    this.el.insertBefore(widget.node, null);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
    // this.el.innerHTML = 'hello trung';
    // const children = this.model.get('children');
    // const manager = this.model.widget_manager;
    // // console.log('children', children);
    // // manager
    // //   .create_view(children[0], {})
    // //   .then((view) => this.el.appendChild(view.pWidget.node));
  }
}

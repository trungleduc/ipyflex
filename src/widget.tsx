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
      layout_config: { borderLeft: false, borderRight: false },
      style: {},
      template_json: null,
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
  _style: any;
  constructor(send_msg: any, model: any, style: any = {}) {
    super();
    this._send_msg = send_msg;
    this._model = model;
    this._style = style;
  }

  onResize = (msg: any) => {
    window.dispatchEvent(new Event('resize'));
  };

  render() {
    return (
      <FlexWidget
        style={this._style}
        send_msg={this._send_msg}
        model={this._model}
      />
    );
  }
}

export class FlexLayoutView extends DOMWidgetView {
  setStyle() {
    const style: { [key: string]: string } = this.model.get('style');
    if (!style) {
      return;
    }
    for (const [key, value] of Object.entries(style)) {
      const fixedKey = key
        .split(/(?=[A-Z])/)
        .map((s) => s.toLowerCase())
        .join('-');
      console.log('setting', fixedKey, value);

      this.el.style[fixedKey] = value;
    }
  }

  render() {
    super.render();
    this.setStyle();
    this.el.classList.add('custom-widget');
    const style: { [key: string]: string } = this.model.get('style');
    const widget = new WidgetWrapper(this.send.bind(this), this.model, style);
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    this.el.insertBefore(widget.node, null);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
  }
}

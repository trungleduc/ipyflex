// Copyright (c) Trung Le
// Distributed under the terms of the Modified BSD License.

import {
  DOMWidgetModel,
  DOMWidgetView,
  ISerializers,
  unpack_models
} from '@jupyter-widgets/base';

// import { UUID } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import FlexWidget from './reactWidget';
import { IDict } from './utils';
import { MODULE_NAME, MODULE_VERSION } from './version';
import { MessageLoop } from '@lumino/messaging';
// Import the CSS
import '../style/widget.css';
import '../style/application.css';
import '../style/buttons.css';

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
      widget_factories: {},
      placeholder_widget: [],
      layout_config: { borderLeft: false, borderRight: false },
      style: {},
      template_json: null,
      editable: true,
      header: false
    };
  }

  static serializers: ISerializers = {
    ...DOMWidgetModel.serializers,
    children: { deserialize: unpack_models as any }
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
    this.widget_manager.create_view(this as DOMWidgetModel, {});
  }

  static model_name = 'FlexLayoutModel';
  static model_module = MODULE_NAME;
  static model_module_version = MODULE_VERSION;
  static view_name = 'FlexLayoutView'; // Set to null if no view
  static view_module = MODULE_NAME; // Set to null if no view
  static view_module_version = MODULE_VERSION;
}

class ReactWidgetWrapper extends ReactWidget {
  constructor(
    send_msg: any,
    model: any,
    style: any = {},
    editable = true,
    header = false
  ) {
    super();
    this._send_msg = send_msg;
    this._model = model;
    this._style = style;
    this._editable = editable;
    this._header = header;
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
        editable={this._editable}
        header={this._header}
      />
    );
  }
  private _send_msg: any;
  private _model: any;
  private _style: any;
  private _editable: boolean;
  private _header: boolean | IDict;
}

export class FlexLayoutView extends DOMWidgetView {
  setStyle(): void {
    const style: { [key: string]: string } = this.model.get('style');
    if (!style) {
      return;
    }
    for (const [key, value] of Object.entries(style)) {
      const fixedKey = key
        .split(/(?=[A-Z])/)
        .map(s => s.toLowerCase())
        .join('-');

      (this.el.style as any)[fixedKey] = value;
    }
  }

  render() {
    super.render();
    this.setStyle();
    this.el.classList.add('custom-widget');
    const style: { [key: string]: string } = this.model.get('style');
    const editable = this.model.get('editable');
    const header = this.model.get('header');
    const widget = new ReactWidgetWrapper(
      this.send.bind(this),
      this.model,
      style,
      editable,
      header
    );
    MessageLoop.sendMessage(widget, Widget.Msg.BeforeAttach);
    this.el.insertBefore(widget.node, null);
    MessageLoop.sendMessage(widget, Widget.Msg.AfterAttach);
  }
}

import 'flexlayout-react/style/light.css';
import * as FlexLayout from 'flexlayout-react';
import React, { Component } from 'react';

import {
  JUPYTER_BUTTON_CLASS,
  IDict,
  MESSAGE_ACTION,
  downloadString
} from './utils';
import { WidgetMenu } from './menuWidget';
import { WidgetWrapper } from './widgetWrapper';
import Header from './headerComponent';
import {
  defaultModelFactoty,
  ILayoutConfig,
  updateModelEditable
} from './defaultModelFactory';
import { dialogBody } from './dialogWidget';
import { showDialog } from '@jupyterlab/apputils';
import { ContextMenu } from '@lumino/widgets';
import { CommandRegistry } from '@lumino/commands';
import { uuid } from '@jupyter-widgets/base';

interface IProps {
  send_msg: (args: { action: string; payload: any }) => void;
  model: any;
  style: IDict;
  editable: boolean;
  header: boolean | IDict;
}

interface IState {
  model: FlexLayout.Model;
  defaultOuterModel: IDict;
  defaultModel: IDict;
  widgetList: Array<string>;
  placeholderList: Array<string>;
  factoryDict: IDict<IDict>;
  editable: boolean;
  header: boolean | IDict;
}

export class FlexWidget extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.innerlayoutRef = {};
    this.layoutConfig = props.model.get('layout_config') as ILayoutConfig;

    const { defaultOuterModel, defaultModel } = defaultModelFactoty(
      this.layoutConfig,
      props.editable
    );

    let template_json = props.model.get('template_json') as IDict;

    if (!template_json || Object.keys(template_json).length === 0) {
      template_json = defaultOuterModel;
    } else {
      template_json = updateModelEditable(
        template_json,
        props.editable,
        this.layoutConfig.enableSection
      );
    }

    let flexModel: FlexLayout.Model;
    try {
      flexModel = FlexLayout.Model.fromJson(template_json as any);
    } catch (e) {
      console.error(e);
      console.warn(
        'Failed to build model with saved templated, using default template.'
      );
      flexModel = FlexLayout.Model.fromJson(defaultOuterModel as any);
    }
    this.state = {
      model: flexModel,
      defaultOuterModel,
      defaultModel,
      widgetList: Object.keys(this.props.model.get('children')),
      placeholderList: [],
      factoryDict: this.props.model.get('widget_factories'),
      editable: props.editable,
      header: props.header
    };
    this.model = props.model;
    this.innerContextMenuCache = new Map<string, ContextMenu>();
  }

  componentDidMount(): void {
    this.props.model.listenTo(this.props.model, 'msg:custom', this.on_msg);
    this.props.model.listenTo(
      this.props.model,
      'change:placeholder_widget',
      this.on_placeholder_change
    );
    this.uuid = uuid();
    this.props.send_msg({
      action: MESSAGE_ACTION.REGISTER_FRONTEND,
      payload: { uuid: this.uuid }
    });
  }

  on_placeholder_change = (
    model: any,
    newValue: Array<string>,
    change: IDict
  ): void => {
    this.setState(old => ({
      ...old,
      placeholderList: newValue
    }));
  };

  on_msg = (data: { action: string; payload: any }, buffer: any[]): void => {
    const { action, payload } = data;
    switch (action) {
      case MESSAGE_ACTION.UPDATE_CHILDREN: {
        const wName: string = payload.name;
        if (
          !this.state.widgetList.includes(wName) &&
          !this.state.placeholderList.includes(wName)
        ) {
          this.setState(old => ({
            ...old,
            widgetList: [...old.widgetList, wName]
          }));
        }
        break;
      }

      case MESSAGE_ACTION.SAVE_TEMPLATE_FROM_PYTHON: {
        const fileName: string = payload.name;
        const uuid: string = payload.uuid;
        if (uuid === this.uuid && fileName) {
          if (!fileName) {
            alert('Invalid file name!');
            return;
          }
          this.props.send_msg({
            action: MESSAGE_ACTION.SAVE_TEMPLATE,
            payload: {
              file_name: fileName,
              json_data: this.state.model.toJson()
            }
          });
        }
        break;
      }

      case MESSAGE_ACTION.LOAD_TEMPLATE_FROM_PYTHON: {
        const template = payload.template;
        this.setState(old => ({
          ...old,
          model: FlexLayout.Model.fromJson(template)
        }));
        break;
      }
    }
  };
  factory = (node: FlexLayout.TabNode): JSX.Element => {
    const component = node.getComponent() as 'Widget' | 'sub';
    const config = node.getConfig();
    const nodeId = node.getId();
    const name = node.getName();
    switch (component) {
      case 'Widget': {
        const selector = '.ipyflex-widget-box';
        const contextMenu = this.individualContextMenuFactory(
          node.getParent()?.getId(),
          node.getParent()?.getModel(),
          selector
        );
        return (
          <WidgetWrapper
            model={this.model}
            widgetName={name}
            factoryDict={this.state.factoryDict}
            send_msg={this.props.send_msg}
            extraData={config.extraData}
            contextMenu={contextMenu}
          />
        );
      }
      case 'sub': {
        return this.generateSection(node, nodeId);
      }
    }
  };

  generateSection = (node: FlexLayout.TabNode, nodeId: string): JSX.Element => {
    let model = node.getExtraData().model;
    let defaultModel: any;
    this.innerlayoutRef[nodeId] = React.createRef<FlexLayout.Layout>();
    if (node.getConfig() && node.getConfig().model) {
      defaultModel = node.getConfig().model;
    } else {
      defaultModel = this.state.defaultModel;
    }

    if (!model) {
      node.getExtraData().model = FlexLayout.Model.fromJson(defaultModel);
      model = node.getExtraData().model;
      // save sub-model on save event
      node.setEventListener('save', (p: any) => {
        this.state.model!.doAction(
          FlexLayout.Actions.updateNodeAttributes(nodeId, {
            config: {
              model: node.getExtraData().model.toJson()
            }
          })
        );
        //  node.getConfig().model = node.getExtraData().model.toJson();
      });
    }
    return (
      <FlexLayout.Layout
        ref={this.innerlayoutRef[nodeId]}
        classNameMapper={className => {
          if (className === 'flexlayout__tabset-selected') {
            className =
              'inner__flexlayout__tabset-selected flexlayout__tabset-selected';
          } else if (className === 'flexlayout__tabset') {
            className = 'inner__flexlayout__tabset flexlayout__tabset';
          } else if (className === 'flexlayout__tab') {
            className = 'inner__flexlayout__tab flexlayout__tab';
          }

          return className;
        }}
        model={model}
        factory={this.factory}
        onRenderTabSet={(
          tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
          renderValues: {
            headerContent?: React.ReactNode;
            buttons: React.ReactNode[];
          }
        ) => {
          this.onRenderTabSet(tabSetNode, renderValues, nodeId);
        }}
        onAction={(action: FlexLayout.Action) =>
          this.innerOnAction(nodeId, action)
        }
        onContextMenu={(
          node:
            | FlexLayout.TabNode
            | FlexLayout.TabSetNode
            | FlexLayout.BorderNode,
          event: React.MouseEvent<HTMLElement, MouseEvent>
        ) => {
          if (event.shiftKey) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const contextMenu = this.innerContextMenuCache.get(node.getId());
          contextMenu?.open(event.nativeEvent);
        }}
      />
    );
  };

  onAction = (action: FlexLayout.Action): FlexLayout.Action => {
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_MaximizeToggle' ||
      action.type === 'FlexLayout_SelectTab'
    ) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }

    return action;
  };

  innerOnAction = (
    outerNodeID: string,
    action: FlexLayout.Action
  ): FlexLayout.Action => {
    if (action.type === 'FlexLayout_DeleteTabset') {
      const id: string = action.data.node;
      if (this.innerContextMenuCache.has(id)) {
        this.innerContextMenuCache.delete(id);
      }
    }
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_DeleteTabset' ||
      action.type === 'FlexLayout_MaximizeToggle' ||
      action.type === 'FlexLayout_SelectTab'
    ) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    }
    return action;
  };

  onRenderTabSet = (
    tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
    renderValues: {
      headerContent?: React.ReactNode;
      buttons: React.ReactNode[];
    },
    nodeId: string
  ): void => {
    const tabsetId = tabSetNode.getId();
    const selector = '.flexlayout__tabset_tabbar_inner_top';
    if (!this.innerContextMenuCache.has(tabsetId)) {
      const contextMenu = this.individualContextMenuFactory(
        tabsetId,
        tabSetNode.getModel(),
        selector
      );

      this.innerContextMenuCache.set(tabsetId, contextMenu);
    }
    if (this.state.editable) {
      renderValues.buttons.push(
        <WidgetMenu
          widgetList={this.state.widgetList}
          placeholderList={this.state.placeholderList}
          factoryDict={this.state.factoryDict}
          nodeId={nodeId}
          tabsetId={tabsetId}
          addTabToTabset={(name: string, extraData?: IDict) => {
            this.innerlayoutRef[nodeId].current?.addTabToTabSet(tabsetId, {
              component: 'Widget',
              name: name,
              config: { layoutID: nodeId, extraData: extraData }
            });
          }}
          model={this.props.model}
          send_msg={this.props.send_msg}
        />
      );
    }
  };

  onAddRow = (): void => {
    this.layoutRef.current?.addTabToActiveTabSet({
      component: 'sub',
      name: 'New section'
    });
  };

  onRenderOuterTabSet = (
    tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
    renderValues: {
      headerContent?: React.ReactNode;
      stickyButtons: React.ReactNode[];
      buttons: React.ReactNode[];
      headerButtons: React.ReactNode[];
    }
  ): void => {
    if (this.state.editable) {
      renderValues.stickyButtons.push(
        <button
          className={JUPYTER_BUTTON_CLASS}
          onClick={this.onAddRow}
          style={{
            width: '25px',
            height: '25px',
            paddingLeft: 'unset',
            paddingRight: 'unset',
            margin: 0
          }}
        >
          <i className="fas fa-plus"></i>
        </button>
      );
    }
  };

  saveTemplate = async (): Promise<void> => {
    const oldTemplate = this.props.model.get('template');

    const result = await showDialog<string>(
      dialogBody('Save template', oldTemplate)
    );
    if (result.button.label === 'Save') {
      const fileName = result.value;
      if (fileName) {
        this.props.send_msg({
          action: MESSAGE_ACTION.SAVE_TEMPLATE,
          payload: {
            file_name: result.value,
            json_data: this.state.model.toJson()
          }
        });
      } else {
        alert('Invalid file name!');
      }
    }
  };

  exportTemplate = async (): Promise<void> => {
    const result = await showDialog<string>(
      dialogBody('Export template', undefined, 'Export')
    );
    if (result.button.label === 'Export') {
      let fileName = result.value;
      if (fileName) {
        fileName = fileName.replace('.json', '') + '.json';
        const jsonString = this.state.model.toString();
        downloadString(jsonString, 'application/json', fileName);
      } else {
        alert('Invalid file name!');
      }
    }
  };

  importTemplate = (content: string): void => {
    const model = JSON.parse(content);
    this.setState(old => ({
      ...old,
      model: FlexLayout.Model.fromJson(model)
    }));
  };

  toggleLock = (): void => {
    this.setState(old => ({ ...old, editable: !old.editable }));
  };

  individualContextMenuFactory = (
    tabsetId?: string,
    model?: FlexLayout.Model,
    selector?: string
  ): ContextMenu => {
    const commands = new CommandRegistry();
    if (!tabsetId || !model || !selector) {
      return new ContextMenu({ commands });
    }
    commands.addCommand('hide-tab-bar', {
      execute: () => {
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(tabsetId, {
            enableTabStrip: false
          })
        );
      },
      label: 'Hide Tab Bar',
      isEnabled: () => true
    });
    commands.addCommand('show-tab-bar', {
      execute: () => {
        model.doAction(
          FlexLayout.Actions.updateNodeAttributes(tabsetId, {
            enableTabStrip: true
          })
        );
      },
      label: 'Show Tab Bar',
      isEnabled: () => true
    });
    const contextMenu = new ContextMenu({ commands });
    contextMenu.addItem({
      command: 'show-tab-bar',
      selector: this.props.editable ? selector : 'null',
      rank: 0
    });
    contextMenu.addItem({
      command: 'hide-tab-bar',
      selector: this.props.editable ? selector : 'null',
      rank: 1
    });
    return contextMenu;
  };

  render(): JSX.Element {
    let headerHeight = 0;
    if (this.state.header) {
      headerHeight = 35;
    }
    const mainHeight = `calc(100% - 5px - ${headerHeight}px)`;
    let titleProps: { [key: string]: any } = {};
    if (this.state.header && !(typeof this.state.header === 'boolean')) {
      titleProps = { ...this.state.header };
      if (!titleProps['buttons']) {
        titleProps['buttons'] = [];
      }
      if (titleProps['buttons'] === true) {
        titleProps['buttons'] = ['save', 'export', 'import'];
      }
      if (!this.props.editable) {
        titleProps['buttons'] = (titleProps['buttons'] as Array<string>).filter(
          btn => btn !== 'save'
        );
      }
    }
    return (
      <div style={{ height: '510px', ...this.props.style }}>
        {this.state.header ? (
          <Header
            {...titleProps}
            saveTemplate={this.saveTemplate.bind(this)}
            exportTemplate={this.exportTemplate.bind(this)}
            importTemplate={this.importTemplate.bind(this)}
          />
        ) : (
          <div />
        )}
        <div
          style={{
            width: '100%',
            height: mainHeight,
            position: 'relative'
          }}
        >
          <FlexLayout.Layout
            ref={this.layoutRef}
            model={this.state.model}
            factory={this.factory}
            supportsPopout={true}
            classNameMapper={className => {
              if (className === 'flexlayout__layout') {
                className = 'ipyflex flexlayout__layout';
              } else if (className === 'flexlayout__tabset-selected') {
                className =
                  'outer__flexlayout__tabset-selected flexlayout__tabset-selected ';
              }
              return className;
            }}
            onAction={this.onAction}
            onRenderTabSet={(
              tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
              renderValues: {
                headerContent?: React.ReactNode;
                stickyButtons: React.ReactNode[];
                buttons: React.ReactNode[];
                headerButtons: React.ReactNode[];
              }
            ) => {
              this.onRenderOuterTabSet(tabSetNode, renderValues);
            }}
          />
        </div>
      </div>
    );
  }

  private layoutRef = React.createRef<FlexLayout.Layout>();
  private innerlayoutRef: { [key: string]: React.RefObject<FlexLayout.Layout> };
  private model: any;
  private layoutConfig: ILayoutConfig;
  private innerContextMenuCache: Map<string, ContextMenu>;
  private uuid?: string;
}

export default FlexWidget;

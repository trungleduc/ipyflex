import 'flexlayout-react/style/light.css';

import { StyledEngineProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import * as FlexLayout from 'flexlayout-react';
import React, { Component } from 'react';

import { JUPYTER_BUTTON_CLASS, IDict } from './utils';
import { WidgetMenu } from './widgetMenu';
import { WidgetWrapper } from './widgetWrapper';
import { defaultModelFactoty, ILayoutConfig } from './defaultModelFactory';
// import Button from '@mui/material/Button';
interface IProps {
  send_msg: any;
  model: any;
}

interface IState {
  model: FlexLayout.Model;
  default_outer_model: IDict;
  default_model: IDict;
}

export class FlexWidget extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.innerlayoutRef = {};
    this.layoutConfig = this.props.model.get('layout_config') as ILayoutConfig;
    const { default_outer_model, default_model } = defaultModelFactoty(
      this.layoutConfig
    );
    this.state = {
      model: FlexLayout.Model.fromJson(default_outer_model as any),
      default_outer_model,
      default_model,
    };
    this.model = props.model;
    this.widgetList = Object.keys(this.model.get('children'));
  }

  factory = (node: FlexLayout.TabNode): JSX.Element => {
    const component = node.getComponent() as 'Widget' | 'sub';
    // const config = node.getConfig();
    const nodeId = node.getId();
    const name = node.getName();

    switch (component) {
      case 'Widget': {
        return <WidgetWrapper model={this.model} widget_name={name} />;
      }
      case 'sub': {
        return this.generateSection(node, nodeId);
      }
    }

    return null;
  };

  generateSection = (node: FlexLayout.TabNode, nodeId: string): JSX.Element => {
    let model = node.getExtraData().model;
    let defaultModel: any;
    this.innerlayoutRef[nodeId] = React.createRef<FlexLayout.Layout>();
    if (node.getConfig() && node.getConfig().model) {
      defaultModel = node.getConfig().model;
    } else {
      defaultModel = this.state.default_model;
    }

    if (!model) {
      node.getExtraData().model = FlexLayout.Model.fromJson(defaultModel);
      model = node.getExtraData().model;
      // save sub-model on save event
      node.setEventListener('save', (p: any) => {
        this.state.model!.doAction(
          FlexLayout.Actions.updateNodeAttributes(nodeId, {
            config: {
              model: node.getExtraData().model.toJson(),
            },
          })
        );
        //  node.getConfig().model = node.getExtraData().model.toJson();
      });
    }
    return (
      <FlexLayout.Layout
        ref={this.innerlayoutRef[nodeId]}
        classNameMapper={(className) => {
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
      />
    );
  };

  onAction = (action: FlexLayout.Action) => {
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_MaximizeToggle' ||
      action.type === 'FlexLayout_SelectTab'
    ) {
      window.dispatchEvent(new Event('resize'));
    }

    return action;
  };

  innerOnAction = (outerNodeID: string, action: FlexLayout.Action) => {
    if (
      action.type === 'FlexLayout_MoveNode' ||
      action.type === 'FlexLayout_AdjustSplit' ||
      action.type === 'FlexLayout_DeleteTab' ||
      action.type === 'FlexLayout_MaximizeToggle'
    ) {
      window.dispatchEvent(new Event('resize'));
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
    renderValues.buttons.push(
      <WidgetMenu
        widgetList={this.widgetList}
        nodeId={nodeId}
        tabsetId={tabsetId}
        addTabToTabset={(name: string) => {
          console.log('called', name, nodeId, tabsetId);
          this.innerlayoutRef[nodeId].current.addTabToTabSet(tabsetId, {
            component: 'Widget',
            name: name,
            config: { layoutID: nodeId },
          });
        }}
      />
    );
  };

  onAddRow = (): void => {
    this.layoutRef.current.addTabToActiveTabSet({
      component: 'sub',
      name: 'New section',
    });
  };

  onRenderOuterTabSet = (
    tabSetNode: FlexLayout.TabSetNode | FlexLayout.BorderNode,
    renderValues: {
      headerContent?: React.ReactNode;
      buttons: React.ReactNode[];
    }
  ): void => {
    renderValues.buttons.push(
      <button
        className={JUPYTER_BUTTON_CLASS}
        onClick={this.onAddRow}
        style={{
          width: '50px',
          height: '25px',
          paddingLeft: 'unset',
          paddingRight: 'unset',
          margin: 0,
        }}
      >
        <i
          style={{ color: 'var(--jp-ui-font-color1)' }}
          className="fas fa-folder-plus fa-2x"
        ></i>
      </button>
    );
  };

  saveLayout = (): void => {
    console.log(this.state.model.toJson());
  };

  render(): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <div style={{ height: '100%' }}>
          <div
            style={{
              width: '100%',
              height: 'calc(100% - 31px)',
            }}
          >
            <FlexLayout.Layout
              ref={this.layoutRef}
              model={this.state.model}
              factory={this.factory}
              supportsPopout={true}
              classNameMapper={(className) => {
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
                  buttons: React.ReactNode[];
                }
              ) => {
                this.onRenderOuterTabSet(tabSetNode, renderValues);
              }}
            />
          </div>
          <Toolbar
            variant="dense"
            style={{
              height: '30px',
              minHeight: '30px',
            }}
          >
            <button className={JUPYTER_BUTTON_CLASS} onClick={this.saveLayout}>
              Save layout
            </button>
          </Toolbar>
        </div>
      </StyledEngineProvider>
    );
  }

  private layoutRef = React.createRef<FlexLayout.Layout>();
  private innerlayoutRef: { [key: string]: React.RefObject<FlexLayout.Layout> };
  private model: any;
  private widgetList: Array<string>;
  private layoutConfig: ILayoutConfig;
}

export default FlexWidget;

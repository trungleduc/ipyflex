import React, { Component } from 'react';
import * as FlexLayout from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import Button from '@mui/material/Button';
import { WidgetWrapper } from './widgetWrapper';
import { WidgetMenu } from './widgetMenu';
import { StyledEngineProvider } from '@mui/material/styles';

// import AddIcon from '@mui/icons-material/Add';

interface IProps {
  send_msg: any;
  model: any;
}

interface IState {
  model: FlexLayout.Model;
}

const DEFAULT_MODEL = {
  global: {
    tabEnableRename: true,
  },
  layout: {
    type: 'row',
    id: '#1',
    children: [
      {
        type: 'tabset',
        id: '#2',
        children: [],
        active: true,
      },
    ],
  },
  borders: [],
};

const DEFAULT_OUTER_MODEL = {
  global: {
    tabEnableRename: true,
    tabSetTabLocation: 'bottom',
  },
  layout: {
    type: 'row',
    id: '#1',
    children: [
      {
        type: 'tabset',
        id: '#2',
        children: [
          {
            type: 'tab',
            id: '#3',
            name: 'New section ',
            component: 'sub',
            config: {
              model: {
                global: {},
                layout: {
                  type: 'row',
                  id: '#1',
                  children: [
                    {
                      type: 'tabset',
                      id: '#3',
                      children: [],
                      active: true,
                    },
                  ],
                },
                borders: [],
              },
            },
          },
        ],
        active: true,
      },
    ],
  },
  borders: [],
};

interface COMPONENT_TYPE {
  grid: string;
  dataView: string;
  controller: string;
  '3Dview': string;
  structureView: string;
  infoView: string;
  PBS: string;
  connectionView: string;
  documentView: string;
  widgetView: string;
}

export class FlexWidget extends Component<IProps, IState> {
  layoutRef = React.createRef<FlexLayout.Layout>();
  innerlayoutRef: { [key: string]: React.RefObject<FlexLayout.Layout> };
  model: any;
  widgetList: Array<string>;
  static COMPONENT_DICT: COMPONENT_TYPE = {
    grid: 'Chart widget',
    dataView: 'Data widget',
    controller: 'Controller widget',
    '3Dview': '3D widget',
    structureView: 'Structure widget',
    infoView: 'System info widget',
    PBS: 'PBS widget',
    connectionView: 'Connection widget',
    documentView: 'Document widget',
    widgetView: 'Custom widget',
  };
  constructor(props: IProps) {
    super(props);
    this.innerlayoutRef = {};
    this.state = {
      model: FlexLayout.Model.fromJson(DEFAULT_OUTER_MODEL as any),
    };
    this.model = props.model;
    this.widgetList = Object.keys(this.model.get('children'));
  }

  factory = (node: FlexLayout.TabNode): JSX.Element => {
    const component = node.getComponent() as 'Widget' | 'sub';
    // const config = node.getConfig();
    const nodeId = node.getId();
    const name = node.getName();
    const nameList = Object.values(FlexWidget.COMPONENT_DICT);
    nameList.push('Section');
    // if (nameList.includes(name)) {
    //   try {
    //     node
    //       .getModel()
    //       .doAction(FlexLayout.Actions.renameTab(nodeId, `${name} ${nodeId}`));
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
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

  generateSection = (node: FlexLayout.TabNode, nodeId: string) => {
    let model = node.getExtraData().model;
    let defaultModel: any;
    this.innerlayoutRef[nodeId] = React.createRef<FlexLayout.Layout>();
    if (node.getConfig() && node.getConfig().model) {
      defaultModel = node.getConfig().model;
    } else {
      defaultModel = DEFAULT_MODEL;
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
      // <Button
      //   onClick={() => {
      //     const tabsetId = tabSetNode.getId();
      //     this.innerlayoutRef[nodeId].current.addTabToTabSet(tabsetId, {
      //       component: 'PBS',
      //       name: FlexWidget.COMPONENT_DICT['PBS'],
      //       config: { layoutID: nodeId },
      //     });
      //   }}
      // >
      //   Add widget{' '}
      // </Button>
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
      <Button
        size="small"
        variant="outlined"
        onClick={this.onAddRow}
        style={{ height: '27px', minWidth: '40px' }}
      >
        <i className="fas fa-plus"></i>
      </Button>
    );
  };

  render(): JSX.Element {
    return (
      <StyledEngineProvider injectFirst>
        <div style={{ height: '100%' }}>
          <div
            style={{
              width: '100%',
              height: 'calc(100%)',
            }}
          >
            <FlexLayout.Layout
              ref={this.layoutRef}
              model={this.state.model}
              factory={this.factory}
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
        </div>
      </StyledEngineProvider>
    );
  }
}

export default FlexWidget;

import React, { Component } from 'react';
import * as FlexLayout from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
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
  }

  factory = (node: FlexLayout.TabNode): JSX.Element => {
    const component = node.getComponent() as keyof COMPONENT_TYPE | 'sub';
    // const config = node.getConfig();
    const nodeId = node.getId();
    // const name = node.getName();
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
      case 'grid': {
        return <div>grid</div>;
      }
      case 'controller': {
        return <div>controller</div>;
      }
      case '3Dview': {
        return <div>3Dview</div>;
      }
      case 'structureView': {
        return <div>structureView</div>;
      }
      case 'PBS': {
        return <div>PBS</div>;
      }
      case 'connectionView': {
        return <div>connectionView</div>;
      }
      case 'infoView': {
        return <div>infoView</div>;
      }
      case 'dataView': {
        return <div>dataView</div>;
      }
      case 'widgetView': {
        return <div>widgetView</div>;
      }
      case 'documentView': {
        return <div>documentView</div>;
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
    // const tabsetId = tabSetNode.getId();
    renderValues.buttons.push(<Button>test </Button>);
  };

  onAddRow = (): void => {
    this.layoutRef.current.addTabToActiveTabSet({
      component: 'sub',
      name: 'New section',
    });
  };

  render(): JSX.Element {
    return (
      <div style={{ height: '100%' }}>
        <div
          style={{
            width: '100%',
            height: 'calc(100% - 36px)',
            background: 'radial-gradient(#efeded, #8f9091)',
          }}
        >
          <FlexLayout.Layout
            ref={this.layoutRef}
            model={this.state.model}
            factory={this.factory}
            classNameMapper={(className) => {
              if (className === 'flexlayout__layout') {
                className =
                  'chartviewer__flexlayout__layout flexlayout__layout ';
              } else if (className === 'flexlayout__tabset-selected') {
                className =
                  'outer__flexlayout__tabset-selected flexlayout__tabset-selected ';
              }
              return className;
            }}
            onAction={this.onAction}
          />
        </div>
        <Toolbar variant="dense">
          <Button onClick={this.onAddRow}>
            {/* <AddCircleOutlineIcon /> */}
            Add section
          </Button>
        </Toolbar>
      </div>
    );
  }
}

export default FlexWidget;

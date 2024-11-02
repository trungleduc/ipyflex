import { IDict } from './utils';

export interface ILayoutConfig {
  borderLeft: boolean;
  borderRight: boolean;
  enableSection: boolean;
}

export function defaultModelFactoty(
  config: ILayoutConfig,
  editable = true
): IDict {
  const { borderLeft, borderRight, enableSection = true } = config;
  const borders = [];
  if (borderLeft) {
    borders.push({
      type: 'border',
      location: 'left',
      size: 250,
      children: []
    });
  }
  if (borderRight) {
    borders.push({
      type: 'border',
      location: 'right',
      size: 250,
      children: []
    });
  }
  const globaleDict = {
    tabEnableRename: editable,
    tabEnableClose: editable,
    tabSetEnableClose: editable,
    tabEnableDrag: editable,
    tabSetEnableDrag: editable
  };
  const defaultModel = {
    global: globaleDict,
    layout: {
      type: 'row',
      id: '#1',
      children: [
        {
          type: 'tabset',
          id: '#2',
          children: [],
          active: true
        }
      ]
    },
    borders
  };

  const defaultOuterModel = {
    global: {
      ...globaleDict,
      tabSetTabLocation: 'bottom',
      tabSetEnableTabStrip: true
    },

    layout: {
      type: 'row',
      id: '#1',
      children: [
        {
          type: 'tabset',
          id: '#2',
          enableTabStrip: enableSection,
          children: [
            {
              type: 'tab',
              id: '#3',
              name: 'New section ',
              component: 'sub',
              config: {
                model: {
                  global: globaleDict,
                  layout: {
                    type: 'row',
                    id: '#1',
                    children: [
                      {
                        type: 'tabset',
                        id: '#3',
                        children: [],
                        active: true
                      }
                    ]
                  },
                  borders
                }
              }
            }
          ],
          active: true
        }
      ]
    },
    borders: []
  };
  return { defaultOuterModel, defaultModel };
}

export function updateModelEditable(
  model: IDict,
  editable: boolean,
  enableSection: boolean
): IDict {
  const globaleDict = {
    tabEnableRename: editable,
    tabEnableClose: editable,
    tabSetEnableClose: editable,
    tabSetEnableMaximize: editable,
    tabEnableDrag: editable,
    tabSetEnableDrag: editable
    // tabSetEnableTabStrip: !!model.tabSetEnableTabStrip,
  };

  let splitterSize: number;
  editable ? (splitterSize = 8) : (splitterSize = 0);
  if ('global' in model) {
    model.global = {
      ...globaleDict,
      tabSetTabLocation: 'bottom'
    };
  }
  const tabsetList = model['layout']['children'];
  for (const tabset of tabsetList) {
    const children = tabset['children'];
    tabset['enableTabStrip'] = enableSection;
    for (const child of children) {
      child['config']['model']['global'] = {
        ...globaleDict,
        ...child['config']['model']['global'],
        splitterSize
      };
    }
  }

  return model;
}

import { IDict } from './utils';

export interface ILayoutConfig {
  borderLeft: boolean;
  borderRight: boolean;
}

export function defaultModelFactoty(
  config: ILayoutConfig,
  editable = true
): IDict {
  const { borderLeft, borderRight } = config;
  const borders = [];
  if (borderLeft) {
    borders.push({
      type: 'border',
      location: 'left',
      size: 250,
      children: [],
    });
  }
  if (borderRight) {
    borders.push({
      type: 'border',
      location: 'right',
      size: 250,
      children: [],
    });
  }
  const globaleDict = {
    tabEnableRename: editable,
    tabEnableClose: editable,
    tabSetEnableClose: editable,
    tabEnableDrag: editable,
    tabSetEnableDrag: editable,
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
          active: true,
        },
      ],
    },
    borders,
  };

  const defaultOuterModel = {
    global: { ...globaleDict, tabSetTabLocation: 'bottom' },

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
                  global: globaleDict,
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
                  borders,
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
  return { defaultOuterModel, defaultModel };
}

export function updateModelEditable(model: IDict, editable: boolean): IDict {
  console.log('start');

  const globaleDict = {
    tabEnableRename: editable,
    tabEnableClose: editable,
    tabSetEnableClose: editable,
    tabEnableDrag: editable,
    tabSetEnableDrag: editable,
  };
  if ('global' in model) {
    model.global = { ...globaleDict, tabSetTabLocation: 'bottom' };
  }
  const children = model['layout']['children'][0]['children'];
  for (const child of children) {
    child['config']['model']['global'] = globaleDict;
  }
  console.log('end');

  return model;
}

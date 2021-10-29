import { IDict } from './utils';

export interface ILayoutConfig {
  borderLeft: boolean;
  borderRight: boolean;
}

export function defaultModelFactoty(config: ILayoutConfig): IDict {
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
  const default_model = {
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
    borders,
  };

  const default_outer_model = {
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
  return { default_outer_model, default_model };
}

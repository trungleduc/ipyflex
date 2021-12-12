export const JUPYTER_BUTTON_CLASS =
  'lm-Widget p-Widget jupyter-widgets jupyter-button widget-button';

export interface IDict<T = any> {
  [key: string]: T;
}

export const MESSAGE_ACTION = {
  SAVE_TEMPLATE: 'save_template',
  UPDATE_CHILDREN: 'update_children',
  REQUEST_FACTORY: 'request_factory',
  RENDER_FACTORY: 'render_factory',
};

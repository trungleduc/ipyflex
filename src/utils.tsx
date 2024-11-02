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
  RENDER_ERROR: 'render_error',
  ADD_WIDGET: 'add_widget',
  SAVE_TEMPLATE_FROM_PYTHON: 'save_template_from_python',
  LOAD_TEMPLATE_FROM_PYTHON: 'load_template_from_python',
  REGISTER_FRONTEND: 'register_frontend'
};

export function downloadString(
  content: string,
  fileType: string,
  fileName: string
): void {
  const blob = new Blob([content], { type: fileType });
  const a = document.createElement('a');
  a.download = fileName;
  a.href = URL.createObjectURL(blob);
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
  }, 2000);
}

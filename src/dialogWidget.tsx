import { Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

class BodyWidget extends Widget {
  constructor(el: HTMLInputElement) {
    super({ node: el });
  }

  getValue(): string {
    return (this.node as HTMLInputElement).value;
  }
}

export default function dialogBody(
  title: string,
  defaultValue: string = null
): {
  title: string;
  body: BodyWidget;
  buttons: Array<any>;
} {
  const saveBtn = Dialog.okButton({ label: 'Save' });
  const cancelBtn = Dialog.cancelButton({ label: 'Cancel' });
  const input = document.createElement('input');

  if (defaultValue) {
    input.value = defaultValue;
  }
  return { title, body: new BodyWidget(input), buttons: [cancelBtn, saveBtn] };
}

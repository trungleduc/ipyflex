import { uuid } from '@jupyter-widgets/base';
import { Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { IDict } from './utils';

class TemplateNameWidget extends Widget {
  constructor(el: HTMLInputElement) {
    super({ node: el });
  }

  getValue(): string {
    return (this.node as HTMLInputElement).value;
  }
}

class FactoryParameterWidget extends Widget {
  constructor(params: Array<string>) {
    super();
    this._paramInputs = {};
    params.forEach((p) => {
      const id = uuid();
      const inp = document.createElement('input');
      this._paramInputs[p] = inp;
      inp.id = id;
      inp.classList.add('ipyflex-float-input');
      const label = document.createElement('label');
      label.htmlFor = id;
      label.innerText = `${p} `;
      label.classList.add('ipyflex-float-label');

      const group = document.createElement('div');
      group.classList.add('ipyflex-input-label-group');
      group.appendChild(inp);
      group.appendChild(label);
      this.node.appendChild(group);
    });
  }

  getValue(): IDict<string> {
    const ret = {};
    for (const [key, inp] of Object.entries(this._paramInputs)) {
      ret[key] = inp.value;
    }
    return ret;
  }

  private _paramInputs: IDict<HTMLInputElement>;
}

export function factoryDialog(
  title,
  params: Array<string>
): {
  title: string;
  body: FactoryParameterWidget;
  buttons: Array<any>;
} {
  const saveBtn = Dialog.okButton({ label: 'Create' });
  const cancelBtn = Dialog.cancelButton({ label: 'Cancel' });
  return {
    title,
    body: new FactoryParameterWidget(params),
    buttons: [cancelBtn, saveBtn],
  };
}

export function dialogBody(
  title: string,
  defaultValue: string = null
): {
  title: string;
  body: TemplateNameWidget;
  buttons: Array<any>;
} {
  const saveBtn = Dialog.okButton({ label: 'Save' });
  const cancelBtn = Dialog.cancelButton({ label: 'Cancel' });
  const input = document.createElement('input');

  if (defaultValue) {
    input.value = defaultValue;
  }
  return {
    title,
    body: new TemplateNameWidget(input),
    buttons: [cancelBtn, saveBtn],
  };
}

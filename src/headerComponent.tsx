import * as React from 'react';
import { IDict } from './utils';
import IconButton from '@mui/material/IconButton';
import { IconFactory, IconType } from './icons';

const buttonTitle: { [key: string]: string } = {
  save: 'Save template',
  import: 'Import template from disk',
  export: 'Export template to disk',
};

export default function Header(props: {
  title?: string;
  style?: IDict;
  buttons?: Array<string>;
  saveTemplate: () => Promise<void>;
  exportTemplate: () => Promise<void>;
}): JSX.Element {
  const buttonList: IconType[] = [];
  const availableButtons: IconType[] = ['save', 'export', 'import'];
  (props.buttons || []).forEach((button) => {
    if (
      availableButtons.includes(button as IconType) &&
      !buttonList.includes(button as IconType)
    ) {
      buttonList.push(button as IconType);
    }
  });
  const callbacks = new Map<IconType, () => Promise<void>>();
  callbacks.set('save', props.saveTemplate);
  callbacks.set('export', props.exportTemplate);
  return (
    <div
      className={'ipyflex-header'}
      style={{
        ...(props.style || {}),
      }}
    >
      <div>{props.title || ''}</div>
      <div style={{ display: 'flex' }}>
        {buttonList.map((btn) => (
          <IconButton
            key={btn}
            color="primary"
            component="span"
            title={buttonTitle[btn]}
            onClick={callbacks.get(btn)}
          >
            <IconFactory icon={btn} color={props.style?.color} />
          </IconButton>
        ))}
      </div>
    </div>
  );
}

import * as React from 'react';
import { IDict } from './utils';

export default function Header(props: {
  text?: string;
  header_style?: IDict;
}): JSX.Element {
  return (
    <div
      className={'ipyflex-header'}
      style={{
        backgroundColor: '#1976d2',
        ...props.header_style,
      }}
    >
      {props.text}
    </div>
  );
}

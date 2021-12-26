import React from 'react';

export type IconType = 'save' | 'import' | 'export';

export function IconFactory(props: {
  icon: IconType;
  color: string;
}): JSX.Element {
  let element: JSX.Element;
  switch (props.icon) {
    case 'save':
      element = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          viewBox="0 0 24 24"
          width="20"
          fill="none"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path
            fill={props.color || 'white'}
            d="M17.59 3.59c-.38-.38-.89-.59-1.42-.59H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7.83c0-.53-.21-1.04-.59-1.41l-2.82-2.83zM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm1-10H7c-1.1 0-2-.9-2-2s.9-2 2-2h6c1.1 0 2 .9 2 2s-.9 2-2 2z"
          />
        </svg>
      );
      break;
    case 'import':
      element = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          fill="none"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path
            fill={props.color || 'white'}
            d="M5 5c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1zm2.41 9H9v5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-5h1.59c.89 0 1.34-1.08.71-1.71L12.71 7.7c-.39-.39-1.02-.39-1.41 0l-4.59 4.59c-.63.63-.19 1.71.7 1.71z"
          />
        </svg>
      );
      break;
    case 'export':
      element = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
          fill="none"
          style={{ transform: 'rotate(180deg)' }}
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path
            fill={props.color || 'white'}
            d="M5 5c0 .55.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1zm2.41 9H9v5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-5h1.59c.89 0 1.34-1.08.71-1.71L12.71 7.7c-.39-.39-1.02-.39-1.41 0l-4.59 4.59c-.63.63-.19 1.71.7 1.71z"
          />
        </svg>
      );
      break;
    default:
      element = <div />;
  }
  return element;
}

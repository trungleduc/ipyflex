import React, { Component } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { JUPYTER_BUTTON_CLASS } from './utils';
interface IProps {
  nodeId: string;
  tabsetId: string;
  widgetList: Array<string>;
  addTabToTabset: (name: string, nodeId: string, tabsetId: string) => void;
}

interface IState {
  anchorEl: HTMLElement;
}

export class WidgetMenu extends Component<IProps, IState> {
  menuItem: Array<JSX.Element>;
  constructor(props: IProps) {
    super(props);
    this.menuItem = props.widgetList.map((name) => (
      <MenuItem
        key={`${name}}@${props.tabsetId}@${props.nodeId}`}
        onClick={() => {
          props.addTabToTabset(name, props.nodeId, props.tabsetId);
          this.handleClose();
        }}
      >
        {name}
      </MenuItem>
    ));
    this.state = {
      anchorEl: null,
    };
  }

  handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const target = event.currentTarget;
    this.setState((oldState) => ({ ...oldState, anchorEl: target }));
  };

  handleClose = () => {
    this.setState((oldState) => ({ ...oldState, anchorEl: null }));
  };

  render(): JSX.Element {
    const menuId = `add_widget_menu_${this.props.tabsetId}@${this.props.nodeId}`;
    return (
      <div key={menuId}>
        <button
          className={JUPYTER_BUTTON_CLASS}
          style={{ height: '27px', width: '40px' }}
          onClick={this.handleClick}
        >
          <i className="fas fa-plus"></i>
        </button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          {this.menuItem}
        </Menu>
      </div>
    );
  }
}

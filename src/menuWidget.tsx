import React, { Component } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import dialogBody from './dialogWidget';
import { showDialog } from '@jupyterlab/apputils';

import { JUPYTER_BUTTON_CLASS } from './utils';
interface IProps {
  nodeId: string;
  tabsetId: string;
  widgetList: Array<string>;
  addTabToTabset: (name: string, nodeId: string, tabsetId: string) => void;
  model: any;
}
interface IState {
  anchorEl: HTMLElement;
  widgetList: Array<string>;
}

const CREATE_NEW = 'Create new';
export class WidgetMenu extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
    this.state = {
      anchorEl: null,
      widgetList: [...props.widgetList, CREATE_NEW],
    };
  }

  on_msg = (data: { action: string; payload: any }, buffer: any[]): void => {
    const { action, payload } = data;
    switch (action) {
      case 'update_children':
        {
          const wName: string = payload.name;
          this.setState((old) => ({
            ...old,
            widgetList: [...old.widgetList, wName],
          }));
        }

        return null;
    }
  };

  handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const target = event.currentTarget;
    this.setState((oldState) => ({ ...oldState, anchorEl: target }));
  };

  handleClose = () => {
    this.setState((oldState) => ({ ...oldState, anchorEl: null }));
  };

  render(): JSX.Element {
    const menuId = `add_widget_menu_${this.props.tabsetId}@${this.props.nodeId}`;
    const menuItem = [];
    for (const name of this.state.widgetList) {
      if (name !== CREATE_NEW) {
        menuItem.push(
          <MenuItem
            key={`${name}}@${this.props.tabsetId}@${this.props.nodeId}`}
            onClick={() => {
              this.props.addTabToTabset(
                name,
                this.props.nodeId,
                this.props.tabsetId
              );
              this.handleClose();
            }}
          >
            {name}
          </MenuItem>
        );
      }
    }
    const createNew: JSX.Element = (
      <MenuItem
        key={`$#{this.props.tabsetId}@${this.props.nodeId}`}
        onClick={async () => {
          this.handleClose();
          let widgetName: string;
          const result = await showDialog<string>(
            dialogBody('Widget name', '')
          );
          if (result.button.label === 'Save' && result.value) {
            widgetName = result.value;
            this.setState((old) => ({
              ...old,
              widgetList: [...old.widgetList, widgetName],
            }));
          } else {
            return;
          }

          this.props.addTabToTabset(
            widgetName,
            this.props.nodeId,
            this.props.tabsetId
          );
        }}
      >
        {CREATE_NEW}
      </MenuItem>
    );
    menuItem.push(createNew);
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
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          {menuItem}
        </Menu>
      </div>
    );
  }
}

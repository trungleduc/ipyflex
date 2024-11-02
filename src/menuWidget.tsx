import React, { Component } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { dialogBody, factoryDialog } from './dialogWidget';
import { showDialog } from '@jupyterlab/apputils';

import { IDict, JUPYTER_BUTTON_CLASS, MESSAGE_ACTION } from './utils';
interface IProps {
  nodeId: string;
  tabsetId: string;
  widgetList: Array<string>;
  placeholderList: Array<string>;
  factoryDict: IDict<IDict>;
  addTabToTabset: (name: string, extraData?: IDict) => void;
  model: any;
  send_msg: (args: { action: string; payload: any }) => void;
}
interface IState {
  anchorEl: HTMLElement | null;
  widgetList: Array<string>;
  placeholderList: Array<string>;
}

const CREATE_NEW = 'Create new';
export class WidgetMenu extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      anchorEl: null,
      widgetList: [...props.widgetList, CREATE_NEW],
      placeholderList: [...props.placeholderList]
    };
  }

  componentDidMount(): void {
    this.props.model.listenTo(this.props.model, 'msg:custom', this.on_msg);
    this.props.model.listenTo(
      this.props.model,
      'change:placeholder_widget',
      this.on_placeholder_change
    );
  }

  on_placeholder_change = (
    model: any,
    newValue: Array<string>,
    change: any
  ): void => {
    this.setState(old => ({
      ...old,
      placeholderList: newValue
    }));
  };

  on_msg = (data: { action: string; payload: any }, buffer: any[]): void => {
    const { action, payload } = data;
    switch (action) {
      case MESSAGE_ACTION.UPDATE_CHILDREN: {
        const wName: string = payload.name;
        if (
          !this.state.widgetList.includes(wName) &&
          !this.state.placeholderList.includes(wName)
        ) {
          this.setState(old => ({
            ...old,
            widgetList: [...old.widgetList, wName]
          }));
        }
        break;
      }
      default:
        return;
    }
  };

  handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    const target = event.currentTarget;
    this.setState(oldState => ({ ...oldState, anchorEl: target }));
  };

  handleClose = (): void => {
    this.setState(oldState => ({ ...oldState, anchorEl: null }));
  };

  render(): JSX.Element {
    const menuId = `add_widget_menu_${this.props.tabsetId}@${this.props.nodeId}`;
    const widgetItems = [];
    for (const name of [
      ...this.state.widgetList,
      ...this.state.placeholderList
    ]) {
      if (name !== CREATE_NEW) {
        widgetItems.push(
          <MenuItem
            key={`${name}}@${this.props.tabsetId}@${this.props.nodeId}`}
            onClick={() => {
              this.props.addTabToTabset(name);
              this.handleClose();
            }}
          >
            {name}
          </MenuItem>
        );
      }
    }

    const factoryItems = [];
    for (const [name, signature] of Object.entries(this.props.factoryDict)) {
      factoryItems.push(
        <MenuItem
          key={`${name}}@${this.props.tabsetId}@${this.props.nodeId}`}
          onClick={async () => {
            this.handleClose();
            const paramList = Object.keys(signature);
            if (paramList.length > 0) {
              const result = await showDialog<IDict<string>>(
                factoryDialog('Factory parameters', signature)
              );
              if (result.button.label === 'Create' && result.value) {
                this.props.addTabToTabset(name, result.value);
              } else {
                return;
              }
            } else {
              this.props.addTabToTabset(name);
            }
          }}
        >
          {name}
        </MenuItem>
      );
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
            if (this.state.widgetList.includes(widgetName)) {
              alert('A widget with the same name is already registered!');
              return;
            }
            if (widgetName in this.props.factoryDict) {
              alert('A factory with the same name is already registered!');
              return;
            }
            this.props.send_msg({
              action: MESSAGE_ACTION.ADD_WIDGET,
              payload: { name: widgetName }
            });
          } else {
            return;
          }

          this.props.addTabToTabset(widgetName);
        }}
      >
        {CREATE_NEW}
      </MenuItem>
    );
    // menuItem.push(createNew);
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
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          {widgetItems}
          <hr className="ipyflex-divider" />
          {factoryItems}
          {Object.keys(this.props.factoryDict).length > 0 ? (
            <hr className="ipyflex-divider" />
          ) : (
            <div />
          )}

          {createNew}
        </Menu>
      </div>
    );
  }
}

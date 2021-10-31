import React, { Component } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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

export class WidgetMenu extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    props.model.listenTo(props.model, 'msg:custom', this.on_msg);
    this.state = {
      anchorEl: null,
      widgetList: props.widgetList,
    };
  }

  on_msg = (data: { action: string; payload: any }, buffer: any[]): void => {
    const { action, payload } = data;
    switch (action) {
      case 'update_children':
        {
          const wName: string = payload.name;
          this.setState(
            (old) => ({
              ...old,
              widgetList: [...old.widgetList, wName],
            }),
            () => {
              console.log('in widgetmenu', this.state);
            }
          );
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
    const menuItem = this.state.widgetList.map((name) => (
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
    ));
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
          {menuItem}
        </Menu>
      </div>
    );
  }
}

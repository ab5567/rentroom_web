import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

const ButtonLabel = styled.span`
  margin-left: 1rem;
`;

class EditMenu extends React.Component {
  static props = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
  }

  state = {
    anchorEl: null,
  };

  handleClick = event => {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  handleEdit = (event) => {
    event.stopPropagation();
    this.setState({ anchorEl: null });
    this.props.onEdit();
  }

  handleDelete = (event) => {
    event.stopPropagation();
    this.setState({ anchorEl: null });
    this.props.onDelete();
  }

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div>
        <IconButton
          aria-label="More"
          aria-owns={open ? 'edit-cell-menu' : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={this.handleClose}>
              <MenuList>
                <MenuItem onClick={this.handleEdit}>
                  <EditIcon/> 
                  <ButtonLabel>Edit</ButtonLabel>
                </MenuItem>
                <MenuItem onClick={this.handleDelete}>
                  <DeleteIcon/> 
                  <ButtonLabel>Delete</ButtonLabel>
                </MenuItem>
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>

      </div>
    );
  }
}

export default EditMenu;

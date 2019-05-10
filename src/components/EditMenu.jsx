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
import CloseIcon from '@material-ui/icons/Close';
import PaymentIcon from '@material-ui/icons/AttachMoney';


const ButtonLabel = styled.span`
  margin-left: 1rem;
`;

class EditMenu extends React.Component {
  static props = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onCloseRequest: PropTypes.func,
    onMarkAsPaid: PropTypes.func,
  }

  state = {
    anchorEl: null,
  };

  handleClick = event => {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = (event) => {
    event.stopPropagation();
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

  handleCloseMaintenanceRequest = (event) => {
    event.stopPropagation();
    this.setState({ anchorEl: null });
    this.props.onCloseRequest();
  }

  handleMarkAsPaid = (event) => {
    event.stopPropagation();
    this.setState({ anchorEl: null });
    this.props.onMarkAsPaid();
  }
  

  render() {
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);
    const { onEdit, onDelete, onCloseRequest, onMarkAsPaid } = this.props;
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
                {
                  onEdit &&
                  <MenuItem onClick={this.handleEdit}>
                    <EditIcon/> 
                    <ButtonLabel>Edit</ButtonLabel>
                  </MenuItem>
                }
                {
                  onDelete &&
                  <MenuItem onClick={this.handleDelete}>
                    <DeleteIcon/> 
                    <ButtonLabel>Delete</ButtonLabel>
                  </MenuItem>
                }
                {
                  onCloseRequest &&
                  <MenuItem onClick={this.handleCloseMaintenanceRequest}>
                    <CloseIcon/> 
                    <ButtonLabel>Close</ButtonLabel>
                  </MenuItem>
                }
                {
                  onMarkAsPaid &&
                  <MenuItem onClick={this.handleMarkAsPaid}>
                    <PaymentIcon/> 
                    <ButtonLabel>Mark as Paid</ButtonLabel>
                  </MenuItem>
                }
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Popover>

      </div>
    );
  }
}

export default EditMenu;

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import TableHeader from 'components/Table/TableHeader';
import EditMenu from 'components/EditMenu';
import { numberWithCommas } from '../../modules/helpers';

const PlaceholderPropertyImage = require('assets/media/images/property_default_placeholder.gif');

const StyledTable = styled(Table)`
  &&& {
    td,
    th {
      font-size: ${props => (props.csvformat === 'true' ? 0.8 : 1)}rem;
      padding: 0 ${props => (props.csvformat === 'true' ? 0.4 : 0.5)}rem;
      white-space: ${props => (props.csvformat === 'true' ? 'nowrap' : 'normal')};
    }
    tr {
      height: ${props => (props.csvformat === 'true' ? 26 : 48)}px;
    }
  }
`;

const Photo = styled.img`
  min-width: 200px;
  width: 200px;
  height: 130px;
  object-fit: cover;
`;

const PropertyItem = styled(Chip)`
  &&& {
    margin-right: 5px;
  }
`;

class ExtendedTable extends React.Component {
  static props = {
    colDefs: PropTypes.array.isRequired,
    data: PropTypes.array,
    order: PropTypes.bool,
    orderBy: PropTypes.string,
    onSelectAllClick: PropTypes.func,
    selected: PropTypes.array,
    rowsPerPage: PropTypes.number,
    page: PropTypes.number,
    onChange: PropTypes.func,
    onEditItem: PropTypes.func,
    onDeleteItem: PropTypes.func,
    onCloseRequestItem: PropTypes.func,
    onMarkItemAsPaid: PropTypes.func,
    onClickRow: PropTypes.func,
    csvFormat: PropTypes.bool,
  };

  handleSelectAllClick = event => {
    let selected;
    if (event.target.checked) {
      selected = this.props.data.map(item => item.id);
    } else {
      selected = [];
    }
    this.props.onChange({ selected });
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';
    if (this.props.orderBy === property && this.props.order === 'desc') {
      order = 'asc';
    }
    this.props.onChange({ order, orderBy });
  };

  handleClick = (event, id) => {
    event.stopPropagation();
    const { selected } = this.props;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    this.props.onChange({ selected: newSelected });
  };

  handleEditItem = itemId => () => {
    let isEditable = this.props.user.role === 'Manager' || this.props.user.role === 'Maintenance' 
    if (window.location.pathname === '/fireadmin/properties') {
      isEditable = true
    }
    if (this.props.onEditItem && isEditable) {
      this.props.onEditItem(itemId);
    }
  };

  handleDeleteItem = itemId => () => {
    if (this.props.onDeleteItem) {
      this.props.onDeleteItem(itemId);
    }
  };

  handleCloseMaintenanceRequest = itemId => () => {
    if (this.props.onCloseRequestItem) {
      this.props.onCloseRequestItem(itemId);
    }
  };

  handleMarkAsPaid = itemId => () => {
    if (this.props.onMarkItemAsPaid) {
      this.props.onMarkItemAsPaid(itemId);
    }
  };

  handleMarkAsPastTenant = itemId => () => {
    if (this.props.onMarkItemAsPaid) {
      this.props.onMarkItemAsPastTenant(itemId);
    }
  };

  handlClickRow = itemId => () => {
    // if (this.props.onClickRow) {
    //   this.props.onClickRow(itemId)
    // }
  };

  isSelected = id => {
    if (this.props.selected) {
      return this.props.selected.indexOf(id) !== -1;
    }
    return false;
  };

  renderCell = (item, col) => {
    if (col.id === 'photo') {
      return <Photo src={item.photo ? item.photo : PlaceholderPropertyImage} />
    } else if (col.id === 'price' || col.id === 'rentRoll' || col.id === 'paid' || col.id === 'amount') {
      return `$${numberWithCommas(item[col.id])}`
    } else if (col.id === 'properties') {
      const properties = item[col.id]
      return (
        properties ? properties.split(',').map(p => <PropertyItem key={p} size="small" label={p}/>) : null
      )
    }else {
      return item[col.id]
    }
  };

  render() {
    const {
      data,
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      colDefs,
      onEditItem,
      onDeleteItem,
      onCloseRequestItem,
      onMarkItemAsPaid,
      onMarkItemAsPastTenant,
      csvFormat,
      user
    } = this.props;

    if (data.length === 0) {
      return <div />;
    }
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    const hasEditing = (onEditItem || onDeleteItem) && user.role === 'Manager';
    const hasSelection = selected !== null && selected !== undefined && user.role === 'Manager';

    return (
      <StyledTable aria-labelledby="tableTitle" csvformat={csvFormat.toString()}>
        <TableHeader
          numSelected={selected ? selected.length : 0}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={this.handleSelectAllClick}
          onRequestSort={this.handleRequestSort}
          rowCount={data.length}
          colDefs={colDefs}
          hasEditing={hasEditing}
          hasSelection={hasSelection}
        />
        <TableBody>
          {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(item => {
            const isSelected = this.isSelected(item.id);
            const menuProps = {
              onEdit: this.handleEditItem(item.id),
              onDelete: this.handleDeleteItem(item.id),
            };
            if (onCloseRequestItem) {
              menuProps.onCloseRequest = this.handleCloseMaintenanceRequest(item.id);
            }
            if (onMarkItemAsPaid) {
              menuProps.onMarkAsPaid = this.handleMarkAsPaid(item.id);
            }
            if (onMarkItemAsPastTenant) {
              menuProps.onMarkAsPastTenant = this.handleMarkAsPastTenant(item.id);
            }

            return (
              <TableRow
                hover
                aria-checked={isSelected}
                tabIndex={-1}
                key={item.id}
                selected={isSelected}
                onClick={this.handleEditItem(item.id)}
              >
                {hasSelection && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      color="primary"
                      onClick={event => this.handleClick(event, item.id)}
                    />
                  </TableCell>
                )}
                {colDefs.map((col, index) => (
                  <TableCell
                    key={`${item.id}_${index}`}
                    align="left"
                    padding={col.disablePadding ? 'none' : 'dense'}
                  >
                    {this.renderCell(item, col)}
                  </TableCell>
                ))}
                {hasEditing && (
                  <TableCell>
                    <EditMenu {...menuProps} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {/* {emptyRows > 0 && (
            <TableRow style={{ height: 49 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )} */}
        </TableBody>
      </StyledTable>
    );
  }

  static defaultProps = {
    csvFormat: false,
  };
}

function mapStateToProps(state) {
  return { 
    user: state.user
  };
}

export default connect(mapStateToProps)(ExtendedTable);

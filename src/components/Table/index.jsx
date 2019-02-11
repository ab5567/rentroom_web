import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TableHeader from 'components/Table/TableHeader';
import EditMenu from 'components/EditMenu';
const PlaceholderPropertyImage = require('assets/media/images/property_default_placeholder.gif');

const StyledTable = styled(Table)`
  &&& {
    td, th {
      font-size: 1rem;
    }
  }
`;

const Photo = styled.img`
  min-width: 200px;
  width: 200px;
  height: 130px;
  object-fit: cover;
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
  }

  handleSelectAllClick = event => {
    let selected;
    if (event.target.checked) {
      selected = this.props.data.map(item => item.id);
    } else {
      selected = [];
    }
    this.props.onChange({ selected })
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';
    if (this.props.orderBy === property && this.props.order === 'desc') {
      order = 'asc';
    }
    this.props.onChange({ order, orderBy });
  }

  handleClick = (event, id) => {
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
  }

  handleEditItem = itemId => () => {
    if (this.props.onEditItem) {
      this.props.onEditItem(itemId)
    }
  }

  handleDeleteItem = itemId => () => {
    if (this.props.onDeleteItem) {
      this.props.onDeleteItem(itemId)
    }
  }

  isSelected = id => this.props.selected.indexOf(id) !== -1;

  render() {
    const { data, order, orderBy, selected, rowsPerPage, page, colDefs } = this.props;

    if (data.length === 0) {
      return <div></div>
    }
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <StyledTable aria-labelledby="tableTitle">
        <TableHeader
          numSelected={selected.length}
          order={order}
          orderBy={orderBy}
          onSelectAllClick={this.handleSelectAllClick}
          onRequestSort={this.handleRequestSort}
          rowCount={data.length}
          colDefs={colDefs}
        />
        <TableBody>
          {data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(item => {
              const isSelected = this.isSelected(item.id);
              return (
                <TableRow
                  hover
                  aria-checked={isSelected}
                  tabIndex={-1}
                  key={item.id}
                  selected={isSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected} color="primary" onClick={event => this.handleClick(event, item.id)}/>
                  </TableCell>
                  {colDefs.map((col, index) => 
                    <TableCell 
                      key={`${item.id}_${index}`} 
                      align="left"
                      padding={col.disablePadding ? 'none' : 'dense'}
                    > 
                      {col.id === 'photo' 
                        ? <Photo src={item.photo ? item.photo : PlaceholderPropertyImage}/>
                        : item[col.id]} 
                    </TableCell>
                  )}
                  <TableCell>
                    <EditMenu
                      onEdit={this.handleEditItem(item.id)}
                      onDelete={this.handleDeleteItem(item.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 49 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
    );
  }
}

export default ExtendedTable
import PropTypes from 'prop-types';
import React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TableSortLabel from '@material-ui/core/TableSortLabel';



class TableHeader extends React.Component {
  static props = {
    colDefs: PropTypes.array.isRequired,
    order: PropTypes.bool,
    orderBy: PropTypes.string,
    numSelected: PropTypes.number,
    rowCount: PropTypes.number,
    onSelectAllClick: PropTypes.func,
    hasEditing: PropTypes.bool
  }

  createSortHandler = (property, sortable) => event => {
    if (sortable) {
      this.props.onRequestSort(event, property);
    }
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, colDefs, hasEditing } = this.props;

    return (
      <TableHead>
        <TableRow>
          {hasEditing &&
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={numSelected === rowCount}
                onChange={onSelectAllClick}
                color="primary"
              />
            </TableCell>
          }
          {colDefs.map(row => (
              <TableCell
                key={row.id}
                align={'left'}
                // padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === row.id}
                  direction={order}
                  onClick={this.createSortHandler(row.id, row.sortable)}
                >
                  {row.label}
                </TableSortLabel>
              </TableCell>
            )
          )}
          {hasEditing && <TableCell/>}
        </TableRow>
      </TableHead>
    );
  }
}

export default TableHeader;

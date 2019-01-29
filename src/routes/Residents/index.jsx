import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import Config from 'config/app';
import { getClass } from 'modules/helpers';

import Table from 'components/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import CircularProgress from '@material-ui/core/CircularProgress';

const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`

export class Residents extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    allData: [],
    data: [],
    location: '',
    leaseEnd: '',
    searchTerm: '',
    page: 1,
    rowsPerPage: 10,
    status: '',
  }

  componentDidMount() {
    const firebasePath = 'property_groups/amicus_properties/users';
    const ref = firebaseDatabase.ref(firebasePath);
    ref.once('value').then((snapshot) => {
      this.processRecords(snapshot.val())
    });
  }

  processRecords = (records) => {
    const residents = [];
    for (var key in records){
      const resident = records[key];
      resident.id = key;
      residents.push(resident);
    }
    const locations = _.compact(_.map(_.uniqBy(residents, 'state'), (item) => item.state));
    const leaseEnds = _.compact(_.map(_.uniqBy(residents, 'lease end'), (item) => item['lease end']));

    this.setState({ 
      allData: residents,
      data: residents,
      locations,
      leaseEnds 
    });
  }

  onChange = (state) => {
    const data = this.state.allData.filter(item => {
      let shouldShow = true;
      if (state.searchTerm) {
        shouldShow = item.name && item.name.includes(state.searchTerm);
      }
      if (state.location) {
        shouldShow = shouldShow && (item.state === state.location)
      }
      if (state.leaseEnd) {
        shouldShow = shouldShow && (item['lease end'] === state.leaseEnd )
      }
      return shouldShow;
    });
    this.setState({ ...state, data });
  }

  // Table Functions //

  desc = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }
  
  stableSort = (array, cmp) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
  }
  
  getSorting = (order, orderBy) => {
    return order === 'desc' ? (a, b) => this.desc(a, b, orderBy) : (a, b) => - this.desc(a, b, orderBy);
  }

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';
    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }
    this.setState({ order, orderBy });
  };

  handleSelectAllClick = event => {
    if (event.target.checked) {
      this.setState(state => ({ selected: state.data.map(item => item.id) }));
      return;
    }
    this.setState({ selected: [] });
  };

  handleClick = (event, id) => {
    const { selected } = this.state;
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
    this.setState({ selected: newSelected });
  };

  isSelected = id => this.state.selected.indexOf(id) !== -1;

  ////////////////////////

  renderTable = () => {
    const { allData, data, order, orderBy, selected, rowsPerPage, page } = this.state;

    if (data.length === 0) {
      return <div></div>
    }

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
     <div >
        <Table aria-labelledby="tableTitle">
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={this.handleSelectAllClick}
            onRequestSort={this.handleRequestSort}
            rowCount={data.length}
          />
          <TableBody>
            {this.stableSort(data, this.getSorting(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(item => {
                const isSelected = this.isSelected(item.id);
                return (
                  <TableRow
                    hover
                    onClick={event => this.handleClick(event, item.id)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={-1}
                    key={item.id}
                    selected={isSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected} color="primary"/>
                    </TableCell>
                    <TableCell component="th" scope="row" padding="none">
                      {item.name}
                    </TableCell>
                    <TableCell align="left">{item.email}</TableCell>
                    <TableCell align="left">{item.state}</TableCell>
                    <TableCell align="left">{item['lease end']}</TableCell>
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 49 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    )

  }

  render() {
    const { allData, data, locations, leaseEnds } = this.state;
    return (
      <Fragment>
        <Header title="Residents"/>
        <SearchSection 
          allLocationArray={locations}
          allStatusArray={[]}
          allLeaseEndArray={leaseEnds}
          rowsLength={data.length}
          onChange={this.onChange}
        />
        <StyledContainer>
          {allData.length === 0 
          ? <CircularProgress />
          : this.renderTable()
          }
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(Residents);

const rows = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name' },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email' },
  { id: 'state', numeric: false, disablePadding: false, label: 'State' },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End' },
];


class EnhancedTableHead extends React.Component {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property);
  };

  render() {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={numSelected === rowCount}
              onChange={onSelectAllClick}
              color="primary"
            />
          </TableCell>
          {rows.map(row => (
              <TableCell
                key={row.id}
                align={'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === row.id}
                  direction={order}
                  onClick={this.createSortHandler(row.id)}
                >
                  {row.label}
                </TableSortLabel>
              </TableCell>
            )
          )}
        </TableRow>
      </TableHead>
    );
  }
}
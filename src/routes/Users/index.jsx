import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';
import Table from 'components/Table';
import Progress from 'components/Progress';
import AddUserModal from './AddUserModal';
import axios from 'axios';

import { getFirebasePaths } from 'constants/index';

const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email', sortable: true },
  { id: 'role', numeric: false, disablePadding: false, label: 'Role', sortable: true },
  { id: 'properties', numeric: false, disablePadding: false, label: 'Properties', sortable: true }
];

const SortColDefs = [
  { id: 'role', label: 'Role', array: [] },
];

const SearchColDefs = ['name'];


export class Users extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    showModal: false,
    selectedItem: { role: 'Owner' }
  }

  getSortColDefs = () => {
    const { users }  = this.props;
    return SortColDefs.map(sortCol => {
      const array = _.compact(_.map(_.uniqBy(users, sortCol.id), (item) => item[sortCol.id]));
      return {
        ...sortCol,
        array
      }
    });
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Users');
  }

  handleBulkDelete = () => {
    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });

    firebaseDatabase.ref('admins')
    .update(deletingItems).then((error) => {
      if (error) {
        console.log('Save Error', error);
        return;
      }
    });
  }
    
  handleEditItem = (itemId) => {
    const selectedItem = this.props.users.find(item => item.id === itemId);
    this.setState({
      showModal: true,
      selectedItem
    });
  }

  handleAddNewUser = () => {
    const selectedItem = { role: 'Owner' }
    this.setState({
      showModal: true,
      selectedItem
    });
  }

  handleDeleteItem = (itemId) => {
    firebaseDatabase.ref('admins')
    .update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Save Error', error);
        return;
      }
    });
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }
 
  sortAndFilterArray = () => {
    const { users } = this.props;
    const { order, orderBy, searchTerm } = this.state;
    const filterArray = users.filter(item => {
      let shouldShow = true;
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let includeSearchTerm = false;
        SearchColDefs.forEach(col => {
          includeSearchTerm = includeSearchTerm || (item[col] && item[col].toLowerCase().includes(lowerCaseSearchTerm));
        }); 
        shouldShow = shouldShow && includeSearchTerm;
      }
      SortColDefs.forEach(sortCol => {
        const filterValue = this.state[sortCol.id];
        if (filterValue) {
          shouldShow = shouldShow && (item[sortCol.id] === filterValue)
        }
      })
      return shouldShow;
    });

    return _.orderBy(filterArray, [orderBy], [order]);
  }

  
  render() {
    const { isUsersLoaded } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Fragment>
        <Progress loading={!isUsersLoaded}/>
        <Header 
          title="Users &amp; Roles"
          bulkDeleteDisabled={selected.length === 0}
          onExport={this.handleExport}
          onBulkDelete={this.handleBulkDelete}
          onAddNewEntry={this.handleAddNewUser}
          addButtonTitle="Add User"
        />
        <SearchSection
          sortColDefs={this.getSortColDefs()} 
          rowsLength={data.length}
          onChange={this.handleStateChange}
        />
        <StyledContainer>
          <Table
            colDefs={ColDefs}
            data={data}
            order={order}
            orderBy={orderBy}
            selected={selected}
            rowsPerPage={rowsPerPage}
            page={page}
            onChange={this.handleStateChange}
            onEditItem={this.handleEditItem}
            onDeleteItem={this.handleDeleteItem}
          />
        </StyledContainer>
        <AddUserModal
          open={this.state.showModal}
          data={this.state.selectedItem}
          onClose={this.handleModal(false)}
        />
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    isUsersLoaded: state.data.isAdminsLoaded,
    users: state.data.admins,
    user: state.user
  };
}

export default connect(mapStateToProps)(Users);


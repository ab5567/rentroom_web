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
import AddEditResidentModal from './AddEditResidentModal';

import { FIRE_DATA_PATHS } from 'constants/index';

const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email', sortable: false },
  { id: 'address', numeric: false, disablePadding: false, label: 'Address', sortable: true },
  { id: 'state', numeric: false, disablePadding: false, label: 'State', sortable: true },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End', sortable: true },
];

const SortColDefs = [
  { id: 'state', label: 'Location', array: [] },
  { id: 'lease end', label: 'Lease End', array: [] },
];

const SearchColDefs = ['name', 'email'];


export class Residents extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  residentAddresses = {};

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    allData: [],
    data: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    sortColDefs: SortColDefs,
    showModal: false,
    loading: false
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.refreshData();
  }

  refreshData = () => {
    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENT_ADDRESSES).once('value').then((snapshot) => {
      const addresses = snapshot.val();
      firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).once('value').then((snapshot) => {
        this.setState({ loading: false });
        this.processRecords(snapshot.val(), addresses);
      });
    });


  }

  processRecords = (records, addresses) => {
    const allData = [];
    for (var key in records){
      const item = records[key];
      item.id = key;
      item.city = item.City || item.city;
      item.state = item.state || item.State;
      item.image = item.img || item.image; 
      item.address = addresses[key] ? addresses[key].Address : '';
      allData.push(item);
    }
    const sortColDefs = this.state.sortColDefs;
    sortColDefs.forEach(sortCol => {
      const array = _.compact(_.map(_.uniqBy(allData, sortCol.id), (item) => item[sortCol.id]));
      sortCol.array = array;
    });

    this.setState({ 
      allData,
      data: allData,
      sortColDefs,
      selected: []
    });
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Residents');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).update(deletingItems).then((error) => {
      if (error) {
        console.log('Bulk Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleEditItem = (itemId) => {
    const selectedItem = this.state.allData.find(item => item.id === itemId);
    this.setState({
      showModal: true,
      selectedItem
    });
  }

  handleDeleteItem = (itemId) => {
    this.setState({ loading: true });

    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }
 
  sortAndFilterArray = () => {
    const { order, orderBy, allData, sortColDefs, searchTerm } = this.state;
    const filterArray = allData.filter(item => {
      let shouldShow = true;
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let includeSearchTerm = false;
        SearchColDefs.forEach(col => {
          includeSearchTerm = includeSearchTerm || (item[col] && item[col].toLowerCase().includes(lowerCaseSearchTerm));
        }); 
        shouldShow = shouldShow && includeSearchTerm;
      }
      sortColDefs.forEach(sortCol => {
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
    const { allData, order, orderBy, selected, rowsPerPage, page, sortColDefs, loading } = this.state;
    const data = this.sortAndFilterArray();
    return (
      <Fragment>
        <Progress loading={loading}/>
        <Header 
          title="Residents"
          bulkDeleteDisabled={selected.length === 0}
          onExport={this.handleExport}
          onBulkDelete={this.handleBulkDelete}
        />
        <SearchSection
          sortColDefs={sortColDefs} 
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
        <AddEditResidentModal
          open={this.state.showModal}
          data={this.state.selectedItem}
          onClose={this.handleModal(false)}
          onSave={this.refreshData}
        />
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(Residents);


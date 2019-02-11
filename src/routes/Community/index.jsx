import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';
import moment from 'moment';
import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';
import history from 'modules/history';

import Progress from 'components/Progress';
import Table from 'components/Table';
import AddEditCommunityModal from './AddEditCommunityModal';
import { FIRE_DATA_PATHS } from 'constants/index';
 
const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'text', numeric: false, disablePadding: false, label: 'Text', sortable: true  },
  { id: 'city', numeric: false, disablePadding: false, label: 'City', sortable: true  },
  { id: 'date', numeric: false, disablePadding: false, label: 'Date', sortable: true  },
];

const SortColDefs = [
  { id: 'city', label: 'Location', array: [] },
  { id: 'date', label: 'Date', array: [] },
];

const SearchColDefs = ['name', 'text'];

export class Community extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],    // checked items in the table
    allData: [],
    data: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    sortColDefs: SortColDefs,
    showModal: false,
    loading: false,
    selectedItem: {}
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.refreshData();
  }

  refreshData = () => {
    firebaseDatabase.ref(FIRE_DATA_PATHS.COMMUNITY).once('value').then((snapshot) => {
      this.setState({ loading: false });
      this.processRecords(snapshot.val())
    });
  }

  processRecords = (records) => {
    const allData = [];
    for (var key in records){
      const item = records[key];
      item.id = key;
      if (!item.date && item.timestamp) {
        const timestamp = Math.round(parseFloat(item.timestamp));
        item.date = moment.unix(timestamp).format('YYYY-MM-DD');
      }
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Community');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    firebaseDatabase.ref(FIRE_DATA_PATHS.COMMUNITY).update(deletingItems).then((error) => {
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
    // console.log('Edit item', itemId);
    // history.push(`${this.props.match.url}/${itemId}`)
  }

  handleDeleteItem = (itemId) => {
    this.setState({ loading: true });

    firebaseDatabase.ref(FIRE_DATA_PATHS.COMMUNITY).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleAddNewEntry = () => {
    this.setState({
      showModal: true,
      selectedItem: { userId: this.props.user.uid }
    });
    // history.push(`${this.props.match.url}/new`)
  }

  handleModal = (showModal) => {
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
    const { order, orderBy, selected, rowsPerPage, page, sortColDefs, loading } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Fragment>
        <Progress loading={loading}/>
        <Header 
          title="Community"
          bulkDeleteDisabled={selected.length === 0}
          onExport={this.handleExport}
          onAddNewEntry={this.handleAddNewEntry}
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
        <AddEditCommunityModal
          open={this.state.showModal}
          data={this.state.selectedItem}
          onClose={() => this.handleModal(false)}
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

export default connect(mapStateToProps)(Community);


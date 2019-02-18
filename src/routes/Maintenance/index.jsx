import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Table from 'components/Table';
import Progress from 'components/Progress';
import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';
import { FIRE_DATA_PATHS } from 'constants/index';
import history from 'modules/history';


const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
  background: #fbfbfb;
`;

const ColDefs = [
  { id: 'photo', numeric: false, disablePadding: false, label: 'Photo', sortable: false },
  { id: 'tenant', numeric: false, disablePadding: false, label: 'Tenant', sortable: true },
  { id: 'tenant_email', numeric: false, disablePadding: false, label: 'Tenant Email', sortable: true },
  { id: 'subject', numeric: false, disablePadding: false, label: 'Subject', sortable: true },
  { id: 'message', numeric: false, disablePadding: false, label: 'Message', sortable: true },
];

const SortColDefs = [
  { id: 'subject', label: 'Subject', array: [] },
]

const SearchColDefs = ['tenant',  'tenant_email', 'message'];


export class Maintenance extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  state = {
    order: 'asc',
    orderBy: SearchColDefs[0],
    selected: [],
    allData: [],
    data: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    sortColDefs: SortColDefs,
    loading: false,
    selectedItem: {}
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.refreshData();
  }

  refreshData = () => {
    firebaseDatabase.ref(FIRE_DATA_PATHS.MAINTENANCE_REQUESTS).once('value').then((snapshot) => {
      this.setState({ loading: false });
      this.processRecords(snapshot.val())
    });
  }


  processRecords = (records) => {
    const allData = [];
    for (var key in records){
      const item = {};
      const object = records[key];
      if (object) {
        item.id = key;
        item.tenant = object.tenant;
        item.tenant_email = object.tenant_email;
        item.tenant_phone = object.tenant_phone;
        item.property = object.property;
        item.subject = object.subject;
        item.photo = object.photo; 
        item.message = object.message; 
        if (item.tenant) {
          allData.push(item);
        }
      }
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Maintenance');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    firebaseDatabase.ref(FIRE_DATA_PATHS.MAINTENANCE_REQUESTS).update(deletingItems).then((error) => {
      if (error) {
        console.log('Bulk Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleEditItem = (itemId) => {
    console.log('Edit item', itemId);
    history.push(`${this.props.match.url}/${itemId}`)
  }

  handleDeleteItem = (itemId) => {
    this.setState({ loading: true });

    firebaseDatabase.ref(FIRE_DATA_PATHS.MAINTENANCE_REQUESTS).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
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
          title="Maintenance"
          onExport={this.handleExport}
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
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(Maintenance);


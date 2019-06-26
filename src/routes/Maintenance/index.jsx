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
import { getFirebasePaths } from 'constants/index';
import history from 'modules/history';


const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 160px);
  overflow: auto;
  background: #fbfbfb;
`;

const ColDefs = [
  { id: 'photo', numeric: false, disablePadding: false, label: 'Photo', sortable: false },
  { id: 'tenant', numeric: false, disablePadding: false, label: 'Tenant', sortable: true },
  { id: 'subject', numeric: false, disablePadding: false, label: 'Subject', sortable: true },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status', sortable: true },
];

const SortColDefs = [
  { id: 'subject', label: 'Subject', array: [] },
  { id: 'status', label: 'Status', array: [] },
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
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    selectedItem: {}
  }


  getSortColDefs = () => {
    const { maintenances }  = this.props;
    return SortColDefs.map(sortCol => {
      const array = _.compact(_.map(_.uniqBy(maintenances, sortCol.id), (item) => item[sortCol.id]));
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Maintenance');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });

    const { user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).MAINTENANCE_REQUESTS).update(deletingItems).then((error) => {
      if (error) {
        console.log('Bulk Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleEditItem = (itemId) => {
    history.push(`${this.props.match.url}/${itemId}`)
  }

  handleDeleteItem = (itemId) => {
    this.setState({ loading: true });

    const { user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).MAINTENANCE_REQUESTS).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }
  
  handleCloseRequest = (itemId) => {
    const { user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).MAINTENANCE_REQUESTS + `/${itemId}`).update({ status: 'Closed' }).then((error) => {
      if (error) {
        console.log('Close Maintenance Request Error', error);
        return;
      }
      this.refreshData();
    });
  }


  handleModal = (showModal) => {
    this.setState({ showModal })
  }
 
  sortAndFilterArray = () => {
    const { maintenances } = this.props;
    const { order, orderBy, searchTerm } = this.state;
    const filterArray = maintenances.filter(item => {
      let shouldShow = true;
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let includeSearchTerm = false;
        SearchColDefs.forEach(col => {
          includeSearchTerm = includeSearchTerm || (item[col] && item[col].toLowerCase().includes(lowerCaseSearchTerm));
        }); 
        shouldShow = shouldShow && includeSearchTerm;
      }
      SearchColDefs.forEach(sortCol => {
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
    const { isMaintenanceLoaded } = this.props 
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();
 
    return (
      <Fragment>
        <Progress loading={!isMaintenanceLoaded}/>
        <Header 
          title="Maintenance"
          onExport={this.handleExport}
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
            onClickRow={this.handleEditItem}
            onCloseRequestItem={this.handleCloseRequest}
          />
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    user: state.user,
    isMaintenanceLoaded: state.data.isMaintenanceLoaded,
    maintenances: state.data.maintenances,
  };
}

export default connect(mapStateToProps)(Maintenance);


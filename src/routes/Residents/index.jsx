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
import CircularProgress from '@material-ui/core/CircularProgress';

const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: true, label: 'Name', sortable: true },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email', sortable: false },
  { id: 'state', numeric: false, disablePadding: false, label: 'State', sortable: true },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End', sortable: true },
];

const SortColDefs = [
  { id: 'state', label: 'Location', array: [] },
  { id: 'status', label: 'Status', array: [] },
  { id: 'lease end', label: 'Lease End', array: [] },
];

const SearchColDefs = ['name', 'email'];


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
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    sortColDefs: SortColDefs
  }

  componentDidMount() {
    const firebasePath = 'property_groups/amicus_properties/users';
    const ref = firebaseDatabase.ref(firebasePath);
    ref.once('value').then((snapshot) => {
      this.processRecords(snapshot.val())
    });
  }

  processRecords = (records) => {
    const allData = [];
    for (var key in records){
      const item = records[key];
      item.id = key;
      allData.push(item);
    }
    const sortColDefs = this.state.sortColDefs;
    sortColDefs.forEach(sortCol => {
      const array = _.compact(_.map(_.uniqBy(allData, sortCol.id), (item) => item[sortCol.id]));
      sortCol.array = array;
    });

    this.setState({ 
      allData,
      sortColDefs
    });
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Residents');
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
    const { allData, order, orderBy, selected, rowsPerPage, page, sortColDefs } = this.state;
    const data = this.sortAndFilterArray();
    return (
      <Fragment>
        <Header 
          title="Residents"
          onExport={this.handleExport}
        />
        <SearchSection
          sortColDefs={sortColDefs} 
          rowsLength={data.length}
          onChange={this.handleStateChange}
        />
        <StyledContainer>
          {allData.length === 0 
          ?  <CircularProgress />
          :  <Table
              colDefs={ColDefs}
              data={data}
              order={order}
              orderBy={orderBy}
              selected={selected}
              rowsPerPage={rowsPerPage}
              page={page}
              onChange={this.handleStateChange}
            />
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


import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Table from 'components/Table';
import CircularProgress from '@material-ui/core/CircularProgress';
import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';


const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'photo', numeric: false, disablePadding: true, label: 'Photo', sortable: false },
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
    sortColDefs: SortColDefs
  }

  componentDidMount() {
    const firebasePath = 'property_groups/amicus_properties/maintenance_requests';
    const ref = firebaseDatabase.ref(firebasePath);
    ref.once('value').then((snapshot) => {
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
      sortColDefs
    });
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Maintenance');
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
          title="Maintenance"
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

export default connect(mapStateToProps)(Maintenance);


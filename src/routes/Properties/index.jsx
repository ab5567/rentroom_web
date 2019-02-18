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
`;

const ColDefs = [
  { id: 'photo', numeric: false, disablePadding: false, label: 'Photo', sortable: false },
  { id: 'location', numeric: false, disablePadding: false, label: 'Location', sortable: true },
  { id: 'city', numeric: false, disablePadding: false, label: 'City', sortable: true },
  { id: 'state', numeric: false, disablePadding: false, label: 'State', sortable: true },
];

const SortColDefs = [
  { id: 'state', label: 'Location', array: [] },
];

const SearchColDefs = ['location'];


export class Properties extends React.PureComponent {
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
    sortColDefs: SortColDefs,
    loading: false,
    selectedItem: {}
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.refreshData();
  }

  refreshData = () => {
    firebaseDatabase.ref(FIRE_DATA_PATHS.PROPERTIES).once('value').then((snapshot) => {
      this.setState({ loading: false });
      this.processRecords(snapshot.val())
    });
  }

  processRecords = (records) => {
    const allData = [];
    for (var key in records){
      const item = {};
      const object = records[key]['building '];
      if (object) {
        item.id = key;
        item.location = key;
        item.name = key;
        item.city = object.City || object.city;
        item.state = object.state || object.State;
        item.photo = object.img || object.image; 
        allData.push(item);
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Properties');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    firebaseDatabase.ref(FIRE_DATA_PATHS.PROPERTIES).update(deletingItems).then((error) => {
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

    firebaseDatabase.ref(FIRE_DATA_PATHS.PROPERTIES).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
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
          title="Properties"
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

export default connect(mapStateToProps)(Properties);


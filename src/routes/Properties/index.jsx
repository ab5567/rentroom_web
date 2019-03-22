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
import EditPropertyModal from './EditPropertyModal';

const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 160px);
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
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    selectedItem: {},
    showAddPropertyModal: false
  }

  getSortColDefs = () => {
    const { properties }  = this.props;
    return SortColDefs.map(sortCol => {
      const array = _.compact(_.map(_.uniqBy(properties, sortCol.id), (item) => item[sortCol.id]));
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Properties');
  }

  handleBulkDelete = () => {
    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    const { user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).PROPERTIES).update(deletingItems).then((error) => {
      if (error) {
        console.log('Bulk Delete Error', error);
        return;
      }
      this.setState({ selected: [] });
    });;
  }

  handleEditItem = (itemId) => {
    history.push(`${this.props.match.url}/${itemId}`)
  }

  handleDeleteItem = (itemId) => {
    console.log('Deleting Item', itemId);
    const { user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).PROPERTIES).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
    });
  }

  handlePropertyModal = showAddPropertyModal => () => {
    this.setState({ showAddPropertyModal })
  }

  sortAndFilterArray = () => {
    const { properties }  = this.props;
    const { order, orderBy, searchTerm } = this.state;
    const filterArray = properties.filter(item => {
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
    const { isPropertiesLoaded } = this.props;
    const { order, orderBy, selected, rowsPerPage, page, showAddPropertyModal } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Fragment>
        <Progress loading={!isPropertiesLoaded}/>
        <Header 
          title="Properties"
          onExport={this.handleExport}
          onAddNewEntry={this.handlePropertyModal(true)}
          addButtonTitle="Add Property"
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
            onDeleteItem={this.handleDeleteItem}
            onEditItem={this.handleEditItem}
            onClickRow={this.handleEditItem}
          />
        </StyledContainer>
        <EditPropertyModal
          open={showAddPropertyModal}
          data={{}}
          onClose={this.handlePropertyModal(false)}
        />
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    isPropertiesLoaded: state.data.isPropertiesLoaded,
    properties: state.data.properties,
    user: state.user   
  };
}

export default connect(mapStateToProps)(Properties);


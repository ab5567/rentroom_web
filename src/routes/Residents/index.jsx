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
import axios from 'axios';

import { getFirebasePaths } from 'constants/index';

const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 160px);
  overflow: auto;
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'address', numeric: false, disablePadding: false, label: 'Address', sortable: true },
  { id: 'price', numeric: false, disablePadding: false, label: 'Balance', sortable: true },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End', sortable: true },
];

const SortColDefs = [
  { id: 'lease end', label: 'Lease End', array: [] },
];

const SearchColDefs = ['name'];


export class Residents extends React.PureComponent {
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
  }

  getSortColDefs = () => {
    const { residents }  = this.props;
    return SortColDefs.map(sortCol => {
      const array = _.compact(_.map(_.uniqBy(residents, sortCol.id), (item) => item[sortCol.id]));
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
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Residents');
  }

  handleBulkDelete = () => {
    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });

    const selectedItem = this.props.residents.find(item => item.id === selected[0]);
    const propertyId = selectedItem.address

    const { user } = this.props;
    firebaseDatabase
      .ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/residents`)
      .update(deletingItems)
      .then(error => {
        if (error) {
          console.log('Bulk Delete Error', error);
          return;
        }
        this.setState({ selected: [] });
      });

    
    // firebaseDatabase.ref(getFirebasePaths(this.props.user.uid).RESIDENTS).update(deletingItems).then((error) => {
    //   if (error) {
    //     console.log('Bulk Delete Error', error);
    //     return;
    //   }
    //   this.setState({ selected: [] });
    // });;
  }

  handleScreen = showScreen => () => {
    this.setState({ isLoading: true });

  axios({
      method: 'post',
      url: ('https://us-central1-ryan-915d2.cloudfunctions.net/screenCustomer'),
    
      }).then( (response) => {
        const firebasePath = "property_groups/amicus_properties/screeningOrder/";
        this._databaseRef = firebaseDatabase.ref(firebasePath);
        this._databaseRef.once('value').then((snapshot) => {
          var link = snapshot.val();
          window.open(link);
          this.setState({ showScreen });
        });
      }).catch(function (error) {
        console.log("Error Response", error);
      }); 
    };
    
  handleEditItem = (itemId) => {
    const selectedItem = this.props.residents.find(item => item.id === itemId);
    this.setState({
      showModal: true,
      selectedItem
    });
  }

  handleDeleteItem = (itemId) => {
    const selectedItem = this.props.residents.find(item => item.id === itemId);
    const propertyId = selectedItem.address

    const { user } = this.props;
    firebaseDatabase
      .ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/residents`)
      .update({ [itemId]: null })
      .then(error => {
        if (error) {
          console.log('Delete Error', error);
        }
      });
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }
 
  sortAndFilterArray = () => {
    const { residents } = this.props;
    const { order, orderBy, searchTerm } = this.state;
    const filterArray = residents.filter(item => {
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
    const { isResidentsLoaded } = this.props;
    const { order, orderBy, selected, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Fragment>
        <Progress loading={!isResidentsLoaded}/>
        <Header 
          title="Residents"
          bulkDeleteDisabled={selected.length === 0}
          onExport={this.handleExport}
          onScreen={this.handleScreen(true)}
          onBulkDelete={this.handleBulkDelete}
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
        <AddEditResidentModal
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
    isResidentsLoaded: state.data.isResidentsLoaded,
    residents: state.data.residents,
    user: state.user
  };
}

export default connect(mapStateToProps)(Residents);


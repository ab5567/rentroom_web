import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import Chart from 'react-apexcharts';
import { Container } from 'styled-minimal';
import SearchSection from 'containers/SearchSection';
import moment from 'moment';
import update from 'immutability-helper';
import { exportCSV } from 'modules/helpers';
import Header from 'containers/Header';
import Table from 'components/Table';
import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Progress from 'components/Progress';
import Avatar from '@material-ui/core/Avatar';
import { FIRE_DATA_PATHS } from 'constants/index';
import SendIcon from '@material-ui/icons/Send';
import AddEditPropertyResidentModal from './AddEditPropertyResidentModal';
import EditPropertyModal from './EditPropertyModal';

const RightArrow = require('assets/media/images/right-arrow.png');


const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const BuildingSection = styled.div`
  width: 100%;
  display: flex;
  margin-top: 2rem;
  
  img {
    height: 19rem;
    border-radius: 1rem;
  }
`;

const GraphWrapper = styled.div`
  width: 250px;
  height: 250px;
  position: relative;
  margin-left: -40px;
  margin-top: -40px;
  margin-bottom: -40px;
`

const BuildingInfo = styled.div`
  flex: 1;
  text-align: left;
  background: white;
  margin-left: 2rem;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: -5px 5px 10px 0 rgba(30, 30, 30, 0.05);
  
  h2 {
    margin-top: 0;
  }
`;

const StatisticSection = styled.div`
  flex: 1;
  display: flex;
`;

const DataSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  div {
    margin-bottom: 1rem;
  }
`;

const ResidentsSection = styled.div`
  margin-top: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: -5px 5px 10px 0 rgba(30, 30, 30, 0.05);
  text-align: left;
`;

const chartOptions = {
  chart: {
    height: 280,
  },
  colors: ["#20E647"],
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 0,
        size: "60%",
        background: "transparent"
      },
      track: {
        dropShadow: {
          enabled: true,
          top: 2,
          left: 0,
          blur: 4,
          opacity: 0.15
        },
      },
      dataLabels: {
        name: {
          offsetY: 0,
          color: "transparent",
          fontSize: "0px",
          show: false
        },
        value: {
          color: "#333333",
          fontSize: "1.5rem",
          show: true
        }
      }
    }
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "vertical",
      gradientToColors: ["#87D4F9"],
      stops: [0, 100]
    }
  },
  stroke: {
    lineCap: "round"
  },
  labels: [""]
};

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email', sortable: false },
  { id: 'lease start', numeric: false, disablePadding: false, label: 'Lease Start', sortable: true },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End', sortable: true },
];

const SortColDefs = [
  { id: 'lease end', label: 'Lease End', array: [] },
  { id: 'lease start', label: 'Lease Start', array: [] },
];

const SearchColDefs = ['name', 'email'];


export class PropertyDetail extends React.PureComponent {
  static propTypes = {
  };

  _databaseRef;

  state = {
    order: 'asc',
    orderBy: 'name',
    selected: [],
    searchTerm: '',
    page: 0,
    rowsPerPage: 10,
    status: '',
    sortColDefs: SortColDefs,
    showModal: false,
    loading: false,
    residents: [],
    selectedItem: {},
    paymentPercent: 0,
    showEditPropertyModal: false
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (id === 'new') {
      return;
    }

    this.setState({ 
      loading: true 
    });

    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).once('value').then((snapshot) => {
      const residents = snapshot.val();
      this.refreshData(residents);
    });
  }

  refreshData = (users) => {
    const id = this.props.match.params.id;
    const firebasePath = `${FIRE_DATA_PATHS.PROPERTIES}/${id}`;
    this._databaseRef = firebaseDatabase.ref(firebasePath);
    this._databaseRef.once('value').then((snapshot) => {
      this.setState({ loading: false });
      if (users) {
        this.setState({ users });
      }
      this.processData(snapshot.val());
    });
  }

  processData = (data) => {
    console.log('Record', data);
    const item = {};
    const building = data['building '];
    item.city = building.City || building.city;
    item.state = building.state || building.State;
    item.photo = building.img || building.image; 

    const residents = [];
    let rentRoll = 0;
    for (var key in data.residents){
      const resident = data.residents[key];
      if (resident) {
        resident.id = key;
        residents.push(resident);
        rentRoll += resident.price;
      }
    }
    const sortColDefs = this.state.sortColDefs;
    sortColDefs.forEach(sortCol => {
      const array = _.compact(_.map(_.uniqBy(residents, sortCol.id), (item) => item[sortCol.id]));
      sortCol.array = array;
    });
    this.setState({ 
      ...item,
      residents,
      sortColDefs,
      selected: [],
      rentRoll,
      paymentPercent: 70
    })
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    exportCSV(ColDefs, this.sortAndFilterArray(), 'Property_Residents');
  }

  handleBulkDelete = () => {
    this.setState({ loading: true });

    const propertyId = this.props.match.params.id;
    const { selected } = this.state; 
    const deletingItems = {};
    selected.forEach(id => {
      deletingItems[id] = null;
    });
    firebaseDatabase.ref(`${FIRE_DATA_PATHS.PROPERTIES}/${propertyId}/residents`).update(deletingItems).then((error) => {
      if (error) {
        console.log('Bulk Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleEditItem = (itemId) => {
    const selectedItem = this.state.residents.find(item => item.id === itemId);
    this.setState({
      showModal: true,
      selectedItem
    });
  }

  handleAddNewEntry = () => {
    this.setState({
      showModal: true,
      selectedItem: {}
    });
  }

  handleDeleteItem = (itemId) => {
    this.setState({ loading: true });
    const propertyId = this.props.match.params.id;
    firebaseDatabase.ref(`${FIRE_DATA_PATHS.PROPERTIES}/${propertyId}/residents`).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
      this.refreshData();
    });;
  }

  handleEditProperty = () => {
    this.setState({ showEditPropertyModal: true });
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }

  handlePropertyModal = showEditPropertyModal => () => {
    this.setState({ showEditPropertyModal })
  }
 
  sortAndFilterArray = () => {
    const { order, orderBy, residents, sortColDefs, searchTerm } = this.state;
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
    const { 
      loading,
      photo,
      city,
      state,
      order, 
      orderBy, 
      selected, 
      rowsPerPage, 
      page, 
      sortColDefs,
      rentRoll,
      paymentPercent
    } = this.state;

    console.log('State', this.state);

    const { id } = this.props.match.params;
    const data = this.sortAndFilterArray();
    console.log('data', data);
    const propertyData = {
      image: photo, 
      city,
      state,
    }

    return (
      <Fragment>
        <Progress loading={loading}/>
        <Header 
          title="Property Details"
          onAddNewEntry={this.handleAddNewEntry}
          onExport={this.handleExport}
          bulkDeleteDisabled={selected.length === 0}
          onBulkDelete={this.handleBulkDelete}
          onEditProperty={this.handleEditProperty}
        />
        <SearchSection
          sortColDefs={sortColDefs} 
          rowsLength={data.length}
          onChange={this.handleStateChange}
        />
        <StyledContainer>
          <BuildingSection>
            <img src={photo} alt={id}/>
            <BuildingInfo>
              <h2>{id}</h2>
              <StatisticSection>
                <GraphWrapper>
                  <Chart options={chartOptions} series={[paymentPercent]} type="radialBar" height="270" width="270"/>
                </GraphWrapper>
                <DataSection>
                  <div>
                    Rentroll: <strong>${rentRoll}</strong>
                  </div>
                  <div>
                    Paid: <strong>${rentRoll}</strong>
                  </div>
                  <div>
                    Outstanding: <strong>${rentRoll}</strong>
                  </div>
                </DataSection>
              </StatisticSection>
            </BuildingInfo>
          </BuildingSection>
          <ResidentsSection>
            <h2>Residents</h2>
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
          </ResidentsSection>
        </StyledContainer>
        <AddEditPropertyResidentModal
          propertyId={id}
          open={this.state.showModal}
          data={this.state.selectedItem}
          onClose={this.handleModal(false)}
          onSave={this.refreshData}
        />
        <EditPropertyModal
          open={this.state.showEditPropertyModal}
          propertyId={id}
          data={propertyData}
          onClose={this.handlePropertyModal(false)}
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

export default connect(mapStateToProps)(PropertyDetail);

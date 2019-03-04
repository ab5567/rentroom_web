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
import { exportCSV, getCurrencyValue } from 'modules/helpers';
import Header from 'containers/Header';
import Table from 'components/Table';
import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Progress from 'components/Progress';
import Segment from 'components/Segment';
import SectionTitle from 'components/SectionTitle';
import Avatar from '@material-ui/core/Avatar';
import { FIRE_DATA_PATHS } from 'constants/index';
import SendIcon from '@material-ui/icons/Send';
import AddEditPropertyResidentModal from './AddEditPropertyResidentModal';
import EditPropertyModal from '../EditPropertyModal';
import { numberWithCommas } from 'modules/helpers';
import MonthSelect from 'components/MonthSelect';


const RightArrow = require('assets/media/images/right-arrow.png');


const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const SelectMonthSection = styled.div`
  width: 100%;
  text-align: right;
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

const BuildingInfo = styled(Segment)`
  flex: 1;
  text-align: left;
  margin-left: 2rem;
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

const ResidentsSection = styled(Segment)`
  margin-top: 2rem;
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
        size: "65%",
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
        value: {
          color: "#333333",
          fontSize: "35px",
          show: true,
          offsetY: -3
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
    showEditPropertyModal: false,
    rentRoll: 0,
    month: moment().format("MMMYYYY"),
  }


  getSortColDefs = () => {
    const { isPropertyLoaded, property } = this.props;
    if (!isPropertyLoaded) {
      return SortColDefs;
    }
    return SortColDefs.map(sortCol => {
      const array = _.compact(_.map(_.uniqBy(property.residents, sortCol.id), (item) => item[sortCol.id]));
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
    const { isPropertyLoaded, isResidentsLoaded } = this.props;
    if (!isPropertyLoaded || !isResidentsLoaded) {
      return;
    }
    const { allValidResidents } = this.sortAndFilterArray();
    const selectedItem = allValidResidents.find(item => item.id === itemId);
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
    const propertyId = this.props.match.params.id;
    firebaseDatabase.ref(`${FIRE_DATA_PATHS.PROPERTIES}/${propertyId}/residents`).update({ [itemId]: null }).then((error) => {
      if (error) {
        console.log('Delete Error', error);
        return;
      }
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

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  sortAndFilterArray = () => {
    const { isPropertyLoaded, property, isResidentsLoaded, residents } = this.props;
    const { order, orderBy, searchTerm, month } = this.state;

    if (!isPropertyLoaded || !isResidentsLoaded || !property.residents) {
      return {
        residents: [],
        rentRoll: 0,
        paid: 0,
        progress: 0,
        allValidResidents: []
      };
    }

    const validResidents = [];
    let rentRoll = 0;
    let paid = 0;
    property.residents.forEach(tenant => {
      let validTenant = tenant;
      if (tenant.uid) {
        const registeredResident = residents.find(resident => resident.id === tenant.uid);
        if (registeredResident) {
          validTenant = {
            ...registeredResident,
            uid: tenant.uid,
            id: tenant.id
          }
        }
      }
      rentRoll += parseFloat(validTenant.price) ? parseFloat(validTenant.price) : 0;
      if (validTenant.paymentHistory && validTenant.paymentHistory[month]) {
        const paidValue = getCurrencyValue(validTenant.paymentHistory[month]);
        paid += paidValue ? paidValue : 0;
      }
      validResidents.push(validTenant);
    });

    const filterArray = validResidents.filter(item => {
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

    const progress = rentRoll ? Math.round((paid / rentRoll) * 100)  : 0;

    return {
      residents: _.orderBy(filterArray, [orderBy], [order]),
      rentRoll,
      paid,
      progress,
      allValidResidents: validResidents
    };
  }

  render() {
    const { property, isPropertyLoaded } = this.props;
    const { photo, city, state } = property;
    const {
      order,
      orderBy,
      selected,
      rowsPerPage,
      page,
      month
    } = this.state;

    console.log('State', this.state);
    console.log('Props', this.props);

    const { id } = this.props.match.params;
    const { residents, rentRoll, paid, progress } = this.sortAndFilterArray();
    
    const propertyData = {
      image: photo,
      city,
      state,
    }

    return (
      <Fragment>
        <Progress loading={!isPropertyLoaded}/>
        <Header
          title="Property Details"
          onAddNewEntry={this.handleAddNewEntry}
          onExport={this.handleExport}
          bulkDeleteDisabled={selected.length === 0}
          onBulkDelete={this.handleBulkDelete}
          onEdit={this.handleEditProperty}
          editButtonTitle="Edit Property"
          addButtonTitle="Add New Tenant"
        />
        <SearchSection
          sortColDefs={this.getSortColDefs()}
          rowsLength={residents.length}
          onChange={this.handleStateChange}
        />
        <StyledContainer>
          <SelectMonthSection>
            <MonthSelect 
              value={month}
              onChange={this.handleChange('month')}
            />
          </SelectMonthSection>
          <BuildingSection>
            <img src={photo} alt={id} />
            <BuildingInfo>
              <SectionTitle>{id}</SectionTitle>
              <StatisticSection>
                <GraphWrapper>
                  <Chart options={chartOptions} series={[progress]} type="radialBar" height="270" width="270" />
                </GraphWrapper>
                <DataSection>
                  <div>
                    Rentroll: <strong>${numberWithCommas(rentRoll)}</strong>
                  </div>
                  <div>
                    Paid: <strong>${numberWithCommas(paid)}</strong>
                  </div>
                  <div>
                    Outstanding: <strong>${numberWithCommas(rentRoll - paid)}</strong>
                  </div>
                </DataSection>
              </StatisticSection>
            </BuildingInfo>
          </BuildingSection>
          <ResidentsSection>
            <SectionTitle>Residents</SectionTitle>
            <Table
              colDefs={ColDefs}
              data={residents}
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
        />
        <EditPropertyModal
          open={this.state.showEditPropertyModal}
          propertyId={id}
          data={propertyData}
          onClose={this.handlePropertyModal(false)}
        />
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  const propertyId = props.match.params.id;
  const property = state.data.properties.find(property => property.id === propertyId) || {};
  return { 
    isPropertyLoaded: state.data.isPropertiesLoaded,
    property,
    isResidentsLoaded: state.data.isResidentsLoaded,
    residents: state.data.residents 
  };
}

export default connect(mapStateToProps)(PropertyDetail);

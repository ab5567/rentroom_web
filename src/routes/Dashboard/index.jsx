import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';
import Chart from 'react-apexcharts';

import Header from 'containers/Header';
import SearchSection from 'containers/SearchSection';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';
import Table from 'components/Table';
import Progress from 'components/Progress';
import Segment from 'components/Segment';
import SectionTitle from 'components/SectionTitle';

import PaymentProcessSection from './PaymentProcessSection';
import { numberWithCommas } from 'modules/helpers';

import { FIRE_DATA_PATHS } from 'constants/index';

const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 80px);
  overflow: auto;
  padding-bottom: 2rem;
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
  margin-right: 2rem;
`;

const TransitInfo = styled(Segment)`
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span {
    font-size: 3rem;
    font-weight: bold;
    margin-top: 2rem;
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
  padding-right: 1rem;
  div {
    margin-bottom: 1rem;
  }
`;

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'email', numeric: false, disablePadding: false, label: 'Email', sortable: false },
  { id: 'address', numeric: false, disablePadding: false, label: 'Address', sortable: true },
  { id: 'state', numeric: false, disablePadding: false, label: 'State', sortable: true },
  { id: 'lease end', numeric: false, disablePadding: false, label: 'Lease End', sortable: true },
];

const SortColDefs = [
  { id: 'state', label: 'Location', array: [] },
  { id: 'lease end', label: 'Lease End', array: [] },
];

const SearchColDefs = ['name', 'email'];

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


export class Dashboard extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  residentAddresses = {};

  state = {
    allData: [],
    sortColDefs: SortColDefs,
    loading: false,
    rentRoll: 0
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.refreshData();
  }

  refreshData = () => {
    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENT_ADDRESSES).once('value').then((snapshot) => {
      const addresses = snapshot.val();
      firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).once('value').then((snapshot) => {
        this.setState({ loading: false });
        this.processRecords(snapshot.val(), addresses);
      });
    });
  }

  processRecords = (records, addresses) => {
    const allData = [];
    const paidUsers = [];
    const outstandingUsers = [];
    let rentRoll = 0;
    for (var key in records){
      const item = records[key];
      item.id = key;
      item.city = item.City || item.city;
      item.state = item.state || item.State;
      item.image = item.img || item.image; 
      item.address = addresses[key] ? addresses[key].Address : '';
      if (item.price == 0) {
        paidUsers.push(item);
      } else if (item.price > 1) {
        outstandingUsers.push(item);
        rentRoll += item.price;
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
      paidUsers,
      outstandingUsers,
      rentRoll,
      sortColDefs,
      paymentPercent: 70
    });
  }


  handleExport = () => {
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }
 
  
  render() {
    const { loading, paidUsers, outstandingUsers, paymentPercent, rentRoll } = this.state;
    return (
      <Fragment>
        <Progress loading={loading}/>
        <Header 
          title="Dashboard"
          onExport={this.handleExport}
        />
        <StyledContainer>
          <BuildingSection>
            <BuildingInfo>
              <SectionTitle>Payment Process</SectionTitle>
              <StatisticSection>
                <GraphWrapper>
                  <Chart options={chartOptions} series={[70]} type="radialBar" height="270" width="270" />
                </GraphWrapper>
                <DataSection>
                  <div>
                    Rentroll: <strong>${numberWithCommas(rentRoll)}</strong>
                  </div>
                  <div>
                    Paid: <strong>${numberWithCommas(rentRoll)}</strong>
                  </div>
                  <div>
                    Outstanding: <strong>${numberWithCommas(rentRoll)}</strong>
                  </div>
                </DataSection>
              </StatisticSection>
            </BuildingInfo>
            <TransitInfo>
              <SectionTitle>In Transit</SectionTitle>
              <div>Funds in route to your bank account</div>
              <span>${numberWithCommas(rentRoll)}</span>
            </TransitInfo>
          </BuildingSection>
          <PaymentProcessSection
            title="Payment Process"
            data={paidUsers}
          />
          <PaymentProcessSection
            title="Outstanding Rent"
            data={outstandingUsers}
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

export default connect(mapStateToProps)(Dashboard);


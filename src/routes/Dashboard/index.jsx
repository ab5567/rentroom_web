import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';
import { Container } from 'styled-minimal';
import Chart from 'react-apexcharts';

import Header from 'containers/Header';
import { getCurrencyValue } from 'modules/helpers';
import Progress from 'components/Progress';
import Segment from 'components/Segment';
import SectionTitle from 'components/SectionTitle';
import MonthSelect from 'components/MonthSelect';

import PaymentProcessSection from './PaymentProcessSection';
import { numberWithCommas } from 'modules/helpers';
import Grid from '@material-ui/core/Grid';


const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 80px);
  overflow: auto;
  padding-bottom: 2rem;
`;

const SelectMonthSection = styled.div`
  width: 100%;
  text-align: right;
  padding-top: 1rem;
`;

const BuildingSection = styled(Grid)`
  &&& {
    margin-top: 2rem;
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
  width: 100%;
  text-align: left;
  min-width: 350px;
`;

const TransitInfo = styled(Segment)`
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 300px;
  height: 100%;

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

const PaymentProgressColDefs = [
  { id: 'location', numeric: false, disablePadding: false, label: 'Location', sortable: true },
  { id: 'progress', numeric: false, disablePadding: false, label: 'Progress', sortable: false },
  { id: 'rentRoll', numeric: false, disablePadding: false, label: 'Rentroll', sortable: true },
  { id: 'paid', numeric: false, disablePadding: false, label: 'Paid', sortable: true },
];

const OutstandingColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'status', numeric: false, disablePadding: false, label: 'Status', sortable: true },
  { id: 'price', numeric: false, disablePadding: false, label: 'Balance', sortable: true },
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
    rentRoll: 0,
    month: moment().format("MMMYYYY"),
  }

  componentDidMount() {
    this.setState({ loading: true });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  getPaymentProgress = () => {
    const { residents, properties } = this.props;
    const { month } = this.state;

    const calculatedProperties = properties.map(property => {
      const tenants = property.residents;
      let rentRoll = 0;
      let paid = 0;
      tenants.forEach(tenant => {
        let validTenant = tenant;
        if (tenant.uid) {
          const registeredResident = residents.find(resident => resident.id === tenant.uid);
          if (registeredResident) {
            console.log('Registered Resident', tenant);
            validTenant = registeredResident;
          }
        }
        rentRoll += parseFloat(validTenant.price) ? parseFloat(validTenant.price) : 0;
        if (validTenant.paymentHistory && validTenant.paymentHistory[month]) {
          const paidValue = getCurrencyValue(validTenant.paymentHistory[month]);
          paid += paidValue ? paidValue : 0;
          console.log('Paid Resident', tenant);
          console.log('Paid Value', paidValue);
        }
      });

      const progress = rentRoll ? Math.round((paid / rentRoll) * 100)  : 0;
      return {
        ...property,
        rentRoll,
        paid,
        progress: progress + '%'
      }
    })
    console.log('calculatedProperties', calculatedProperties);
    return calculatedProperties;
  }

  getTotalStatics = (progressData) => {
    let totalRentRoll = 0;
    let totalPaid = 0;
    progressData.forEach(property => {
      totalRentRoll += property.rentRoll;
      totalPaid += property.paid;
    });
    const totalProgress = totalRentRoll ? Math.round((totalPaid / totalRentRoll) * 100)  : 0;

    return {
      totalRentRoll,
      totalPaid,
      totalProgress
    }
  }

  getOutstandingUsers = () => {
    const { residents } = this.props;
    const { month } = this.state;
    const outstandingUsers = [];
    residents.forEach(resident => {
      let status = 'Outstanding';
      // Actually it's correct, should be clarify 
      // if (resident.paymentHistory && resident.paymentHistory[month]) {
      //   status = 'Paid';
      // }
      if (resident.price === 0) {
        status = 'Paid';
      }
      outstandingUsers.push({
        ...resident,
        status
      });
    })
    return outstandingUsers;
  }

  handleModal = showModal => () => {
    this.setState({ showModal })
  }

  render() {
    const { isResidentsLoaded, isPropertiesLoaded } = this.props; 
    const { month } = this.state;
    const loading = !isResidentsLoaded || !isPropertiesLoaded;
    const paymentProgressData = this.getPaymentProgress();
    const {
      totalRentRoll,
      totalPaid,
      totalProgress
    } = this.getTotalStatics(paymentProgressData);

    console.log(this.state);
    return (
      <Fragment>
        <Progress loading={loading} />
        <Header
          title="Dashboard"
        />
        <StyledContainer>
          <SelectMonthSection>
            <MonthSelect 
              value={month}
              onChange={this.handleChange('month')}
            />
          </SelectMonthSection>
          <BuildingSection container spacing={16}>
            <Grid item xs>
              <BuildingInfo>
                <SectionTitle>Payment Progress</SectionTitle>
                <StatisticSection>
                  <GraphWrapper>
                    <Chart options={chartOptions} series={[totalProgress]} type="radialBar" height="270" width="270" />
                  </GraphWrapper>
                  <DataSection>
                    <div>
                      Rentroll: <strong>${numberWithCommas(totalRentRoll)}</strong>
                    </div>
                    <div>
                      Paid: <strong>${numberWithCommas(totalPaid)}</strong>
                    </div>
                    <div>
                      Outstanding: <strong>${numberWithCommas(totalRentRoll - totalPaid)}</strong>
                    </div>
                  </DataSection>
                </StatisticSection>
              </BuildingInfo>
            </Grid>
            <Grid item xs>
              <TransitInfo>
                <SectionTitle>In Transit</SectionTitle>
                <div>Funds in route to your bank account</div>
                <span>${numberWithCommas(11111)}</span>
              </TransitInfo>
            </Grid>
          </BuildingSection>
          <PaymentProcessSection
            title="Payment Progress"
            data={paymentProgressData}
            colDefs={PaymentProgressColDefs}
          />
          <PaymentProcessSection
            title="Outstanding Rent"
            data={this.getOutstandingUsers()}
            colDefs={OutstandingColDefs}
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
    isResidentsLoaded: state.data.isResidentsLoaded,
    isPropertiesLoaded: state.data.isPropertiesLoaded,
    residents: state.data.residents, 
    properties: state.data.properties
  };
}

export default connect(mapStateToProps)(Dashboard);


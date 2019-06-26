import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Router, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import SideNavBar from 'containers/SideNavBar';
import Dashboard from 'routes/Dashboard';
import Residents from 'routes/Residents';
import AddEditResident from 'routes/Residents/AddEditResident';
import Community from 'routes/Community';
import Invoices from 'routes/Invoices';
import Reports from 'routes/Reports';
import AddEditCommunity from 'routes/Community/AddEditCommunity';
import Properties from 'routes/Properties';
import PropertyDetail from 'routes/Properties/PropertyDetail';
import Maintenance from 'routes/Maintenance';
import Users from 'routes/Users';
import MaintenanceRequestDetails from 'routes/Maintenance/MaintenanceRequestDetails';
import RoutePrivate from 'components/RoutePrivate';
import { media } from 'modules/theme';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import ButtonBase from '@material-ui/core/ButtonBase';

import { firebaseDatabase } from 'config/firebase';
import { getFirebasePaths } from 'constants/index';
import {
  fetchResidentsSuccess,
  fetchAddressesSuccess,
  fetchPropertiesSuccess,
  fetchMaintenancesSuccess,
  fetchAdminsSuccess,
  userLoginSuccess
} from 'actions/index';

import { setPropertyGroup, getPropertyGroup, getCurrencyValue } from 'modules/helpers';
import { Typography } from '@material-ui/core';

const Screen = styled.div`
  height: 100vh;
  display: flex;
`;

const Body = styled.div`
  height: 100vh;
  background: #fbfbfb;
  position: absolute;
  left: 250px;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;

  ${media.mobile`
    left: 0;
    transform: translateX(${props => (props.mobileOpened ? '-250' : '0')}px);
  `};
`;

const MobileHeader = styled.div`
  width: 100%;
  height: 70px;
  background-color: #333333;
  display: none;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;

  span {
    font-size: 1.7rem;
    font-weight: bold;
    color: white;
  }

  svg {
    fill: white;
    font-size: 35px;
  }

  ${media.mobile`
    display: flex;
  `};
`;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  overflow-y: scroll;

  ${media.mobile`
    height: calc(100vh - 70px);
  `};
`;

let websiteUrl = '';

export class Private extends React.PureComponent {
  static propTypes = {};

  state = {
    openMobileMenu: false,
    showStripeModal: false,
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.getScreenWdith);
  }

  componentDidMount() {
    this.startFetchingFirebaseData();
    this.getScreenWdith();
    window.addEventListener('resize', this.getScreenWdith);
  }

  checkStripe = () => {
    if (window.location.href.includes('code=')) {
      const questionIndex = window.location.href.indexOf('?');
      const stripeCode = this.props.history.location.query.code;
      websiteUrl = window.location.href.substring(0, questionIndex);
      console.log('Stripe code', stripeCode);
      console.log('websiteUrl', websiteUrl);

      // https://us-central1-ryan-915d2.cloudfunctions.net/createStripeAccount
      // https://us-central1-rentroom-dev.cloudfunctions.net/createStripeAccount
      // this.setState({ showStripeModal: true })

      const propertyGroup = getPropertyGroup(this.props.user.uid);

      axios
        .post('https://us-central1-rentroom-dev.cloudfunctions.net/createStripeAccount', {
          stripe_auth_code: stripeCode,
          user_id: this.props.user.uid,
          property_group: propertyGroup,
        })
        .then(response => {
          if (response.status == 200) {
            this.setState({ showStripeModal: true });
          }
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  handleCloseStripeModal = () => {
    window.location.replace(websiteUrl);
  };

  getScreenWdith = () => {
    const { openMobileMenu } = this.state;
    const screenWidth = window.innerWidth;
    if (screenWidth > 768 && openMobileMenu) {
      this.setState({ openMobileMenu: false });
    }
  };

  startFetchingFirebaseData = () => {
    const { dispatch, user } = this.props;
    const userId = user.uid;
    firebaseDatabase.ref('admins').once('value', snapshot => {
      const admins = snapshot.val();
      console.log('admins...', admins);
      const currentAdmin = admins[userId];
      const groupId = currentAdmin ? currentAdmin.property_groups : null;
      if (groupId) {
        setPropertyGroup(userId, groupId);
        dispatch(userLoginSuccess(currentAdmin));
        this.startFetchAdmins();
        this.checkStripe();
        this.startFetchAddresses();
        this.startFetchMaintenances();
        this.startFetchProperties();
      } else {
        console.error('This user has no property group.');
      }
    });
  };

  startFetchAddresses = () => {
    const { dispatch, user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).RESIDENT_ADDRESSES).on('value', snapshot => {
      const addresses = snapshot.val();
      console.log('Updating Addresses Store...', addresses);
      dispatch(fetchAddressesSuccess(addresses));
      // this.startFetchResidents();
    });
  };


  startFetchAdmins = () => {
    const { dispatch, user } = this.props;
    const userId = user.uid;
    firebaseDatabase.ref('admins').on('value', snapshot => {
      const admins = snapshot.val();
      const currentAdmin = admins[userId];
      const groupId = currentAdmin ? currentAdmin.property_groups : null;
      if (groupId) {
        const adminArray = [];
        for (const uid in admins) {
          const admin = admins[uid];
          if (uid !== userId && admin.property_groups && admin.property_groups === groupId) {
            admin.id = uid;
            adminArray.push(admin);
          }
        }
        dispatch(fetchAdminsSuccess(adminArray));
      }
    });
  };

  // startFetchResidents = () => {
  //   const { dispatch, data, user } = this.props;
  //   const { addresses } = data;
  //   firebaseDatabase.ref(getFirebasePaths(user.uid).RESIDENTS).on('value', snapshot => {
  //     const residents = snapshot.val();
  //     console.log('Updating Resident Store...', residents);
  //     const allData = [];
  //     for (const key in residents) {
  //       const item = residents[key];
  //       item.id = key;
  //       item.city = item.city || item.City;
  //       item.state = item.state || item.State;
  //       item.image = item.image || item.img;
  //       item.address = addresses[key] ? addresses[key].Address : '';
  //       allData.push(item);
  //     }
  //     dispatch(fetchResidentsSuccess(allData));
  //   });
  // };

  startFetchMaintenances = () => {
    const { dispatch, user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).MAINTENANCE_REQUESTS).on('value', snapshot => {
      const records = snapshot.val();
      const userRole = user.role;
      const userProperties = user.properties;
      console.log('Updating Maintenance Store...', records);
      const allData = [];
      for (const key in records) {
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
          item.status = object.status ? object.status : 'Opened';
          item.address = object.address
          const messages = [];
          for (const messageKey in object.messages) {
            const message = object.messages[messageKey];
            if (message) {
              messages.push(message);
            }
          }
          item.messages = messages;
          if (item.tenant) {
            if (userRole === 'Manager' || (userRole === 'Maintenance' && object.address && userProperties.includes(object.address))) {
              allData.push(item);
            }
          }
        }
      }
      dispatch(fetchMaintenancesSuccess(allData));
    });
  };

  startFetchProperties = () => {
    const { dispatch, user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).PROPERTIES).on('value', snapshot => {
      const records = snapshot.val();
      console.log('Updating Properties Store...', records);
      const userRole = user.role;
      const userProperties = user.properties;
      const allData = [];
      const allResidents = [];
      for (const key in records) {
        if (userRole !== 'Manager' && !userProperties.includes(key)) {
          continue;
        }
        const record = records[key];
        const item = {};
        const object = record['building '];
        if (object) {
          item.id = key;
          item.location = key;
          item.name = key;
          item.city = object.city || object.City;
          item.state = object.state || object.State;
          item.photo = object.img || object.image;
        }

        const payments = [];
        for (const userKey in record.payments) {
          const userPayments = record.payments[userKey];
          for (const monthKey in userPayments) {
            const paymentAmount = userPayments[monthKey];
            const payment = {
              resident: userKey,
              amount: paymentAmount,
              month: monthKey
            }
            payments.push(payment)
          }
        }
        item.payments = payments;

        let rentRoll = 0;
        const residents = [];
        for (const userKey in record.residents) {
          const resident = record.residents[userKey];
          if (resident) {
            resident.id = userKey;
            resident.city = resident.city || resident.City;
            resident.state = resident.state || resident.State;
            resident.image = resident.image || resident.img;
            resident.address = key;
            resident.status = resident.pastTenant ? 'Past' : 'Active'
            resident.paymentHistory = record.payments ? record.payments[userKey] : name;
            residents.push(resident);
            allResidents.push(resident);
            if (!resident.pastTenant) {
              rentRoll += (resident.monthlyRent ? getCurrencyValue(resident.monthlyRent) : 0);
            }
          }
        }
        item.residents = residents;
        item.rentRoll = rentRoll

        const accounts = [];
        for (const userKey in record.accounts) {
          const account = record.accounts[userKey];
          if (account) {
            account.id = userKey;
            accounts.push(account);
          }
        }
        item.accounts = accounts;
        allData.push(item);
      }
      dispatch(fetchPropertiesSuccess(allData));
      dispatch(fetchResidentsSuccess(allResidents));
    });
  };

  handleMobileMenu = () => {
    this.setState(prevState => ({
      openMobileMenu: !prevState.openMobileMenu,
    }));
  };

  render() {
    const { match, user } = this.props;
    const { openMobileMenu } = this.state;
    const role = user.role

    return (
      <Screen key="Private" data-testid="PrivateWrapper">
        <SideNavBar mobileOpened={openMobileMenu} {...this.props} />
        <Body mobileOpened={openMobileMenu}>
          <MobileHeader>
            <span>RENTROOM</span>
            <ButtonBase onClick={this.handleMobileMenu}>
              {openMobileMenu ? <CloseIcon /> : <MenuIcon />}
            </ButtonBase>
          </MobileHeader>
          <Container>
            <Switch>
              {(role === 'Owner' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/dashboard`}
                  exact
                  component={Dashboard}
                />
              }
              {(role === 'Owner' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/properties`}
                  exact
                  component={Properties}
                />
              }
              {(role === 'Owner' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/properties/:id`}
                  exact
                  component={PropertyDetail}
                />
              }
              {(role === 'Owner' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/residents`}
                  exact
                  component={Residents}
                />
              }
              {(role === 'Maintenance' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/residents/:id`}
                  exact
                  component={AddEditResident}
                />
              }
              {(role === 'Maintenance' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/maintenance`}
                  exact
                  component={Maintenance}
                />
              }
              {role === 'Manager' &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/users`}
                  exact
                  component={Users}
                />
              }
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/storage`}
                  exact
                  component={Maintenance}
                />
              {(role === 'Maintenance' || role === 'Manager') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/maintenance/:id`}
                  exact
                  component={MaintenanceRequestDetails}
                />
              }
              {role === 'Manager' &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/community`}
                  exact
                  component={Community}
                />
              }
              {(role === 'Maintenance' || role === 'Owner') &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/invoices`}
                  exact
                  component={Invoices}
                />
              }
              {role === 'Manager' &&
                <RoutePrivate
                  isAuthenticated
                  path={`/fireadmin/community/:id`}
                  exact
                  component={AddEditCommunity}
                />
              }
              {(role === 'Owner' || role === 'Manager') &&
                <RoutePrivate isAuthenticated path={`/fireadmin/reports`} exact component={Reports} />
              }
              {(role === 'Owner' || role === 'Manager') &&
                <Redirect from={`/fireadmin/`} to={`/fireadmin/dashboard`}/>
              }
              {role === 'Maintenance' &&
                <Redirect from={`/fireadmin/`} to={`/fireadmin/maintenance`}/>
              }
            </Switch>
          </Container>
        </Body>
        <Dialog open={this.state.showStripeModal} onClose={this.handleCloseStripeModal}>
          <DialogTitle id="alert-dialog-title">Success</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Successfully connected your Stripe account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseStripeModal} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </Screen>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    user: state.user,
    data: state.data,
  };
}

export default connect(mapStateToProps)(Private);

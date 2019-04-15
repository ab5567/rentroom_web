import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Router, Switch, Route } from 'react-router-dom';
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
import Reports from 'routes/Reports';
import AddEditCommunity from 'routes/Community/AddEditCommunity';
import Properties from 'routes/Properties';
import PropertyDetail from 'routes/Properties/PropertyDetail';
import Maintenance from 'routes/Maintenance';
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
} from 'actions/index';

import { setPropertyGroup, getPropertyGroup } from 'modules/helpers';
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
      console.log(this.props);

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
          console.log(response);
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
    const userId = this.props.user.uid;
    const propertyGroup = getPropertyGroup(userId);
    if (propertyGroup) {
      this.checkStripe();
      this.startFetchAddresses();
      this.startFetchMaintenances();
      this.startFetchProperties();
    } else {
      firebaseDatabase.ref('admins').once('value', snapshot => {
        const admins = snapshot.val();
        console.log('Admins...', admins);
        const groupId = admins[userId].property_groups;
        if (groupId) {
          setPropertyGroup(userId, groupId);
          this.checkStripe();
          this.startFetchAddresses();
          this.startFetchMaintenances();
          this.startFetchProperties();
        } else {
          console.error('This user has no property group.');
        }
      });
    }
  };

  startFetchAddresses = () => {
    const { dispatch, user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).RESIDENT_ADDRESSES).on('value', snapshot => {
      const addresses = snapshot.val();
      console.log('Updating Addresses Store...', addresses);
      dispatch(fetchAddressesSuccess(addresses));
      this.startFetchResidents();
    });
  };

  startFetchResidents = () => {
    const { dispatch, data, user } = this.props;
    const { addresses } = data;
    firebaseDatabase.ref(getFirebasePaths(user.uid).RESIDENTS).on('value', snapshot => {
      const residents = snapshot.val();
      console.log('Updating Resident Store...', residents);
      const allData = [];
      for (const key in residents) {
        const item = residents[key];
        item.id = key;
        item.city = item.city || item.City;
        item.state = item.state || item.State;
        item.image = item.image || item.img;
        item.address = addresses[key] ? addresses[key].Address : '';
        allData.push(item);
      }
      dispatch(fetchResidentsSuccess(allData));
    });
  };

  startFetchMaintenances = () => {
    const { dispatch, user } = this.props;
    firebaseDatabase.ref(getFirebasePaths(user.uid).MAINTENANCE_REQUESTS).on('value', snapshot => {
      const records = snapshot.val();
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
          const messages = [];
          for (const messageKey in object.messages) {
            const message = object.messages[messageKey];
            if (message) {
              messages.push(message);
            }
          }
          item.messages = messages;
          if (item.tenant) {
            allData.push(item);
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
      const allData = [];
      for (const key in records) {
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

        const residents = [];
        for (const userKey in record.residents) {
          const resident = record.residents[userKey];
          if (resident) {
            resident.id = userKey;
            residents.push(resident);
          }
        }
        item.residents = residents;

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
    });
  };

  handleMobileMenu = () => {
    this.setState(prevState => ({
      openMobileMenu: !prevState.openMobileMenu,
    }));
  };

  render() {
    const { match } = this.props;
    const { openMobileMenu } = this.state;
    const baseUrl = match.url;
    return (
      <Screen key="Private" data-testid="PrivateWrapper">
        <SideNavBar mobileOpened={openMobileMenu} {...this.props} />
        <Body mobileOpened={openMobileMenu}>
          <MobileHeader>
            <span>RENT ROOM</span>
            <ButtonBase onClick={this.handleMobileMenu}>
              {openMobileMenu ? <CloseIcon /> : <MenuIcon />}
            </ButtonBase>
          </MobileHeader>
          <Container>
            <Switch>
              <RoutePrivate isAuthenticated path={`${baseUrl}`} exact component={Residents} />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/dashboard`}
                exact
                component={Dashboard}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/properties`}
                exact
                component={Properties}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/properties/:id`}
                exact
                component={PropertyDetail}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/residents`}
                exact
                component={Residents}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/residents/:id`}
                exact
                component={AddEditResident}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/maintenance`}
                exact
                component={Maintenance}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/maintenance/:id`}
                exact
                component={MaintenanceRequestDetails}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/community`}
                exact
                component={Community}
              />
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}/community/:id`}
                exact
                component={AddEditCommunity}
              />
              <RoutePrivate isAuthenticated path={`${baseUrl}/reports`} exact component={Reports} />
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

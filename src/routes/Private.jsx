import React from 'react';
import styled from 'styled-components';
import { Router, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import SideNavBar from 'containers/SideNavBar';
import Dashboard from 'routes/Dashboard';
import Residents from 'routes/Residents';
import AddEditResident from 'routes/Residents/AddEditResident';
import Community from 'routes/Community';
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
import { FIRE_DATA_PATHS } from 'constants/index';
import {   
  fetchResidentsSuccess,  
  fetchAddressesSuccess,  
  fetchPropertiesSuccess,  
  fetchMaintenancesSuccess    
} from 'actions/index';
import { Button } from '@material-ui/core';


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
    transform: translateX(${props => props.mobileOpened ? '-250' : '0'}px);
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

export class Private extends React.PureComponent {
  static propTypes = {
  };

  state = {
    openMobileMenu: false
  }
  
  componentWillUnmount() {
    window.removeEventListener("resize", this.getScreenWdith);
  }

  componentDidMount() {
    this.startFetchAddresses();
    this.startFetchMaintenances();
    this.startFetchProperties();

    this.getScreenWdith();
    window.addEventListener("resize", this.getScreenWdith);
  }

  getScreenWdith = () => {
    const { openMobileMenu } = this.state;
    const screenWidth = window.innerWidth;
    if (screenWidth > 768 && openMobileMenu) {
      this.setState({ openMobileMenu: false });
    } 
  }

  startFetchAddresses = () => {
    const { dispatch } = this.props;
    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENT_ADDRESSES).on('value', (snapshot) => {
      const addresses = snapshot.val();
      console.log('Updating Addresses Store...', addresses);
      dispatch(fetchAddressesSuccess(addresses));
      this.startFetchResidents();
    });
  }

  startFetchResidents = () => {
    const { dispatch, data } = this.props;
    const addresses = data.addresses;
    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).on('value', (snapshot) => {
      const residents = snapshot.val();
      console.log('Updating Resident Store...', residents);
      const allData = [];
      for (var key in residents) {
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
  }

  startFetchMaintenances = () => {
    const { dispatch } = this.props;
    firebaseDatabase.ref(FIRE_DATA_PATHS.MAINTENANCE_REQUESTS).on('value', (snapshot) => {
      const records = snapshot.val();
      console.log('Updating Maintenance Store...', records);
      const allData = [];
      for (let key in records){
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
          const messages = [];
          for (let messageKey in object.messages){
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
  }

  startFetchProperties = () => {
    const { dispatch } = this.props;
    firebaseDatabase.ref(FIRE_DATA_PATHS.PROPERTIES).on('value', (snapshot) => {
      const records = snapshot.val();
      console.log('Updating Properties Store...', records);
      const allData = [];
      for (let key in records){
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
        for (let userKey in record.residents) {
          const resident = record.residents[userKey];
          if (resident) {
            resident.id = userKey;
            residents.push(resident);
          }
        }
        item.residents = residents;
        allData.push(item);
      }
      dispatch(fetchPropertiesSuccess(allData));
    });
  }

  handleMobileMenu = () => {
    this.setState(prevState => ({
      openMobileMenu: !prevState.openMobileMenu
    }));
  }

  render() {
    const { match } = this.props;
    const { openMobileMenu } = this.state;
    const baseUrl = match.url;
    return (
      <Screen key="Private" data-testid="PrivateWrapper">
        <SideNavBar
          mobileOpened={openMobileMenu} 
          {...this.props}
        />
        <Body mobileOpened={openMobileMenu}>
          <MobileHeader>
            <span>RENT ROOM</span>
            <ButtonBase onClick={this.handleMobileMenu}>
              {openMobileMenu ? <CloseIcon/> : <MenuIcon/>}
            </ButtonBase>
          </MobileHeader>
          <Container>
            <Switch>
              <RoutePrivate
                isAuthenticated
                path={`${baseUrl}`}
                exact
                component={Residents}/>
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
            </Switch>
          </Container>
        </Body>
      </Screen>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    user: state.user,
    data: state.data 
  };
}

export default connect(mapStateToProps)(Private);

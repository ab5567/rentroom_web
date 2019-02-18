import React from 'react';
import styled from 'styled-components';
import { Router, Switch, Route } from 'react-router-dom';

import { Container } from 'styled-minimal';
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
`

const Private = (props) => {
  const { match } = props;
  const baseUrl = match.url;

  return (
    <Screen key="Private" data-testid="PrivateWrapper">
      <SideNavBar {...props}/>
      <Body>
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
      </Body>
    </Screen>
    )
  };

export default Private;

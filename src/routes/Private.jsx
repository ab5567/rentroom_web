import React from 'react';
import styled from 'styled-components';
import { Router, Switch, Route } from 'react-router-dom';

import { Container } from 'styled-minimal';
import SideNavBar from 'containers/SideNavBar';
import Dashboard from 'routes/Dashboard';
import Residents from 'routes/Residents';
import Community from 'routes/Community';
import Properties from 'routes/Properties';
import Maintenance from 'routes/Maintenance';

import RoutePrivate from 'components/RoutePrivate';


const Screen = styled.div`
  height: 100vh;
  display: flex;
`;

const Body = styled.div`
  height: 100vh;
  background: white;
  position: absolute;
  left: 250px;
  right: 0;
  top: 0;
  bottom: 0;
`

const Private = () => (
  <Screen key="Private" data-testid="PrivateWrapper">
    <SideNavBar />
    <Body>
      <Switch>
      <RoutePrivate
          isAuthenticated
          path="/fireadmin"
          exact
          component={Residents}/>
        <RoutePrivate
          isAuthenticated
          path="/fireadmin/dashboard"
          exact
          component={Dashboard}
        />
        <RoutePrivate
          isAuthenticated
          path="/fireadmin/properties"
          exact
          component={Properties}
        />
        <RoutePrivate
          isAuthenticated
          path="/fireadmin/residents"
          exact
          component={Residents}
        />
        <RoutePrivate
          isAuthenticated
          path="/fireadmin/maintenance"
          exact
          component={Maintenance}
        />
        <RoutePrivate
          isAuthenticated
          path="/fireadmin/community"
          exact
          component={Community}
        />
      </Switch>
    </Body>
  </Screen>
);

export default Private;

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import rgba from 'polished/lib/color/rgba';
import { appColor, headerHeight } from 'modules/theme';
import { NavLink } from 'react-router-dom';
import { utils } from 'styled-minimal';
import Avatar from '@material-ui/core/Avatar';
import { logOut } from 'actions/index';
import { media } from 'modules/theme';
import { firebaseDatabase } from 'config/firebase';
import { getFirebasePaths } from 'constants/index';
import axios from 'axios';

const Nav = styled.nav`
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 250px;
  background-color: #333333;
  overflow: hidden;
  transition: width 0.3s linear;
  padding: 20px 0px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  transform: translateX(0);

  button {
    margin-top: auto;
    margin-bottom: 30px;
    color: white;
    font-size: 14px;
  }

  ${media.mobile`
    left: 100%;
    transform: translateX(${props => (props.mobileOpened ? '-100' : '0')}%);
  `};
`;

const UserSection = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  color: white;
  justify-content: center;

  div {
    height: 60px;
    width: 60px;
    background: white;
    border-radius: 30px;
  }

  span {
    font-size: 1.7rem;
    font-weight: bold;
  }

  img {
    width: 80px;
    height: 80px;
    border-radius: 40px;
  }
`;

const MenuLink = styled(NavLink)`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  padding: 10px 40px;
  font-size: 14px;

  span {
    white-space: nowrap;
  }

  &:hover,
  &:focus,
  &.selected {
    text-decoration: none;
    background: #4b74ff;
  }
`;

const MenuExternalLink = styled.a`
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  padding: 10px 40px;
  font-size: 14px;
  pointer-events: ${props => props.isActive ? 'all' : 'none'};

  span {
    white-space: nowrap;
  }

  &:hover,
  &:focus {
    text-decoration: none;
    background: #4b74ff;
  }
`;

const isActive = (path, match, location) => !!(match || path === location.pathname);

class SideNavBar extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  state = {
    paymentStateLoaded: false,
    paymentLink: 'https://connect.stripe.com/express/oauth/authorize?redirect_uri=&client_id=ca_DkHC2qSIwRYt66xQqUrDNmkgbyzeoyMv',
    paymentLabel: 'Payments'
  }

  handleClickLogout = () => {
    const { dispatch } = this.props;
    dispatch(logOut());
  };

  componentDidMount() {
    const { user } = this.props;
    firebaseDatabase.ref(`${getFirebasePaths(user.uid).RESIDENTS}/${user.uid}/stripeAccountId`).once('value', snapshot => {

      const stripeAccountId = snapshot.val();
      if (stripeAccountId) {
        axios
        .post('https://us-central1-rentroom-dev.cloudfunctions.net/stripeconnectlink', {
          stripe_auth_code: stripeAccountId,
        })
        .then(response => {
          if (response.status == 200) {
            this.setState({
              paymentLink: response.data.url,
              paymentStateLoaded: true,
              paymentLabel: 'Payments'
            })
          }
        })
        .catch(error => {
          console.log(error);
        });
        
      } else {
        this.setState({
          paymentLink: 'https://connect.stripe.com/express/oauth/authorize?redirect_uri=&client_id=ca_DkHC2qSIwRYt66xQqUrDNmkgbyzeoyMv',
          paymentStateLoaded: true,
          paymentLabel: 'Payments Setup'
        })
      }
    });
  }

  render() {
    const { mobileOpened } = this.props;
    const { paymentStateLoaded, paymentLink, paymentLabel } = this.state;

    return (
      <Nav mobileOpened={mobileOpened}>
        <UserSection>
          <span>RENT ROOM</span>
          {/* <div></div> */}
          {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" className={classes.avatar} /> */}
          {/* <span>{user.email}</span> */}
        </UserSection>
        <MenuLink to="/fireadmin/dashboard" exact={true} activeClassName="selected">
          <span>Dashboard</span>
        </MenuLink>
        <MenuLink to="/fireadmin/properties" exact={true} activeClassName="selected">
          <span>Properties</span>
        </MenuLink>
        <MenuLink to="/fireadmin/residents" activeClassName="selected">
          <span>Resident</span>
        </MenuLink>
        {/* <MenuLink to="/fireadmin/listings" className="listings" activeClassName="selected">
          <span>Listings</span>
        </MenuLink> */}
        <MenuLink to="/fireadmin/maintenance" activeClassName="selected">
          <span>Maintenance</span>
        </MenuLink>
        <MenuLink to="/fireadmin/community" activeClassName="selected">
          <span>Community</span>
        </MenuLink>
        <MenuLink to="/fireadmin/reports" activeClassName="selected">
          <span>Reports</span>
        </MenuLink>
        {/* <MenuLink to="/fireadmin/metriccs" className="metriccs" activeClassName="selected">
          <span>Metrics</span>
        </MenuLink> */}
        <MenuExternalLink href={paymentLink} isActive={paymentStateLoaded}>
          <span>{paymentLabel}</span>
        </MenuExternalLink>
        <MenuExternalLink href="https://ryan-915d2.firebaseapp.com/">
          <span>Help</span>
        </MenuExternalLink>
        <button onClick={this.handleClickLogout}>Logout</button>
      </Nav>
    );
  }
}

function mapStateToProps(state) {
  return { 
    user: state.user
  };
}

export default connect(mapStateToProps)(SideNavBar);

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
import DashboardIcon from '@material-ui/icons/Dashboard';
import MessageIcon from '@material-ui/icons/Message';
import HomeIcon from '@material-ui/icons/Home';
import PersonIcon from '@material-ui/icons/Person';
import HelpIcon from '@material-ui/icons/Help';
import CommunityIcon from '@material-ui/icons/Announcement';
import ChartIcon from '@material-ui/icons/InsertChart';
import MoneyIcon from '@material-ui/icons/AttachMoney';
import DocsIcon from '@material-ui/icons/LibraryBooks';


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
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  padding: 10px 40px;
  font-size: 15px;

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
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  color: white;
  padding: 10px 40px;
  font-size: 15px;
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

const Logos = styled.div`
padding: 10px;
right: 1rem;
`;

const isActive = (path, match, location) => !!(match || path === location.pathname);

class SideNavBar extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  state = {
    paymentStateLoaded: false,
    paymentLink: 'https://connect.stripe.com/express/oauth/authorize?redirect_uri=&client_id=ca_DkHCisWdsaFR5yZe0gOL2Kys1WNu4CSm',
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
        .post('https://us-central1-ryan-915d2.cloudfunctions.net/stripeconnectlink', {
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
          paymentLink: 'https://connect.stripe.com/express/oauth/authorize?redirect_uri=&client_id=ca_DkHCisWdsaFR5yZe0gOL2Kys1WNu4CSm',
          paymentStateLoaded: true,
          paymentLabel: 'Payments Setup'
        })
      }
    });
  }

  render() {
    const { mobileOpened, user } = this.props;
    const { paymentStateLoaded, paymentLink, paymentLabel } = this.state;
    const role = user.role

    return (
      <Nav mobileOpened={mobileOpened}>
        <UserSection>
          <span>RENTROOM</span>
          {/* <div></div> */}
          {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" className={classes.avatar} /> */}
          {/* <span>{user.email}</span> */}
        </UserSection>
        {(role === 'Owner' || role === 'Manager') &&
          <MenuLink to="/fireadmin/dashboard" exact={true} activeClassName="selected">
            <Logos><DashboardIcon /></Logos>
            <span>Dashboard</span>
          </MenuLink>
        }
        {(role === 'Owner' || role === 'Manager') &&
          <MenuLink to="/fireadmin/properties" exact={true} activeClassName="selected">
            <Logos><HomeIcon /></Logos>
            <span>Properties</span>
          </MenuLink>
        }
        {(role === 'Owner' || role === 'Manager') &&
          <MenuLink to="/fireadmin/residents" activeClassName="selected">
            <Logos><PersonIcon /></Logos>
            <span>Residents</span>
          </MenuLink>
        }
        {(role === 'Maintenance' || role === 'Manager') &&
          <MenuLink to="/fireadmin/maintenance" activeClassName="selected">
            <Logos><MessageIcon /></Logos>
            <span>Maintenance</span>
          </MenuLink>
        }
        {role === 'Manager' &&
          <MenuLink to="/fireadmin/users" activeClassName="selected">
            <Logos><MessageIcon /></Logos>
            <span>Users &amp; Roles</span>
          </MenuLink>
        }
        {role === 'Manager' &&
          <MenuLink to="/fireadmin/community" activeClassName="selected">
            <Logos><CommunityIcon /></Logos>
            <span>Community</span>
          </MenuLink>
        }
        {(role === 'Owner' || role === 'Manager') &&
          <MenuLink to="/fireadmin/reports" activeClassName="selected">
            <Logos><ChartIcon /></Logos>
            <span>Reports</span>
          </MenuLink>
        }
        {(role === 'Maintenance' || role === 'Owner') &&
          <MenuLink to="/fireadmin/invoices" activeClassName="selected">
            <Logos><ChartIcon /></Logos>
            <span>Invoices</span>
          </MenuLink>
        }
        {/* <MenuLink to="/fireadmin/metriccs" className="metriccs" activeClassName="selected">
          <span>Metrics</span>
        </MenuLink> */}
        <MenuExternalLink href={paymentLink} isActive={paymentStateLoaded}>
          <Logos><MoneyIcon /></Logos>
          <span>{paymentLabel}</span>
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

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


const Nav = styled.nav`
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 250px;
  background-color: #333333;
  overflow: hidden;
  transition:width .3s linear;
  padding: 20px 0px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;

  button {
    margin-top: auto;
    margin-bottom: 30px;
    color: white;
    font-size: 14px;
  }
`;

const UserSection = styled.div`
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  color: white;
  padding-left: 40px;

  div {
    height: 60px;
    width: 60px;
    background: white;
    border-radius: 30px;
  }

  span {
    margin-left: 10px;
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

  &:hover, &:focus, &.selected {
    text-decoration: none;
    background: #4b74ff;    
  }
`;


class SideNavBar extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
  };


  handleClickLogout = () => {
    const { dispatch } = this.props;
    dispatch(logOut());
  };

  render() {

    return (
      <Nav>
        <UserSection>
          <div></div>
          {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" className={classes.avatar} /> */}
          <span>keynexa</span>
        </UserSection>
        <MenuLink to="/fireadmin/dashboard" exact className="dashboard" activeClassName="selected">
          <span>Dashboard</span>
        </MenuLink>
        <MenuLink to="/fireadmin/properties" exact className="properties" activeClassName="selected">
          <span>Properties</span>
        </MenuLink>
        <MenuLink to="/fireadmin/residents" exact className="residents" activeClassName="selected">
          <span>Resident</span>
        </MenuLink>
        <MenuLink to="/fireadmin/listings" exact className="listings" activeClassName="selected">
          <span>Listings</span>
        </MenuLink>
        <MenuLink to="/fireadmin/maintenance" exact className="maintenance" activeClassName="selected">
          <span>Maintenance</span>
        </MenuLink>
        <MenuLink to="/fireadmin/community" exact className="community" activeClassName="selected">
          <span>Community</span>
        </MenuLink>
        <MenuLink to="/fireadmin/metriccs" exact className="metriccs" activeClassName="selected">
          <span>Metrics</span>
        </MenuLink>
        <MenuLink to="/fireadmin/payments" exact className="payments" activeClassName="selected">
          <span>Payments Setup</span>
        </MenuLink>
        <MenuLink to="/fireadmin/help" exact className="help" activeClassName="selected">
          <span>Help</span>
        </MenuLink>
        <button onClick={this.handleClickLogout}>Logout</button>
      </Nav> 
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(SideNavBar);

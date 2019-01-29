import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import config from 'config';
import { login } from 'actions/index';

import { Button, Container, Text, utils } from 'styled-minimal';
import Background from 'components/Background';
import Icon from 'components/Icon';
import Logo from 'components/Logo';

export class Dashboard extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  render() {
    return (
      <div>Dashboard</div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(Dashboard);
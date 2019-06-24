import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Header from 'containers/Header';
import Progress from 'components/Progress';


const StyledContainer = styled(Container)`
  text-align: center;
  // height: calc(100% - 80px);
  overflow: auto;
  padding-bottom: 2rem;
`;

export class Invoices extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.setState({ loading: true });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    return (
      <Fragment>
        <Progress loading={false} />
        <Header
          title="Invoices"
        />
        <StyledContainer>
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    user: state.user
  };
}

export default connect(mapStateToProps)(Invoices);


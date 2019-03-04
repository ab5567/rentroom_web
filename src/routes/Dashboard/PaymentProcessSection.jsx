import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import history from 'modules/history';

import Table from 'components/Table';
import Segment from 'components/Segment';
import SectionTitle from 'components/SectionTitle';
import TablePagination from 'components/TablePagination';


const Container = styled(Segment)`
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default class PaymentProcessSection extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.array,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    page: 0,
    rowsPerPage: 5,
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  sortAndFilterArray = () => {
    const { data } = this.props;
    const { order, orderBy } = this.state;
    return _.orderBy(data, [orderBy], [order]);
  }

  handleChange = (key, value) => {
		this.setState({ [key]: value });
  }

  handleRowClick = (itemId) => {
    const { title } = this.props;
    if (title === 'Payment Progress') {
      history.push(`/fireadmin/properties/${itemId}`);
    }
  }

  render() {
    const { title, colDefs } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Container>
        <Header>
          <SectionTitle>{title}</SectionTitle>
          <TablePagination
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            labelDisplayedRows={({from, to, count}) => `${from} - ${to}  of ${count}`}
            backIconButtonProps={{
              'aria-label': 'Previous Page',
            }}
            nextIconButtonProps={{
              'aria-label': 'Next Page',
            }}
            onChangePage={(e, newPage) => this.handleChange('page', newPage)}
            onChangeRowsPerPage={e => this.handleChange('rowsPerPage', e.target.value)}
          />
        </Header>
        <Table
          colDefs={colDefs}
          data={data}
          order={order}
          orderBy={orderBy}
          rowsPerPage={rowsPerPage}
          page={page}
          selected={[]}
          onChange={this.handleStateChange}
          onClickRow={this.handleRowClick}
        />
      </Container>
    );
  }
}



import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

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

const ColDefs = [
  { id: 'name', numeric: false, disablePadding: false, label: 'Name', sortable: true },
  { id: 'address', numeric: false, disablePadding: false, label: 'Address', sortable: true },
  { id: 'price', numeric: false, disablePadding: false, label: 'Balance', sortable: true },
];

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

  render() {
    const { title } = this.props;
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
          colDefs={ColDefs}
          data={data}
          order={order}
          orderBy={orderBy}
          rowsPerPage={rowsPerPage}
          page={page}
          selected={[]}
          onChange={this.handleStateChange}
        />
      </Container>
    );
  }
}



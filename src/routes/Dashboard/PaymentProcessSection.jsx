import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import history from 'modules/history';

import Table from 'components/Table';
import Segment from 'components/Segment';
import SectionTitle from 'components/SectionTitle';
import TablePagination from 'components/TablePagination';
import Grid from '@material-ui/core/Grid';

const Container = styled(Segment)`
  margin-top: 2rem;
`;

export default class PaymentProcessSection extends React.PureComponent {
  static propTypes = {
    data: PropTypes.array,
    title: PropTypes.string.isRequired,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    page: 0,
    rowsPerPage: 5,
  };

  handleStateChange = state => {
    this.setState(state);
  };

  sortAndFilterArray = () => {
    const { data } = this.props;
    const { order, orderBy } = this.state;
    return _.orderBy(data, [orderBy], [order]);
  };

  handleChange = (key, value) => {
    this.setState({ [key]: value });
  };

  handleRowClick = itemId => {
    const { title } = this.props;
    if (title === 'Payment Progress') {
      history.push(`/fireadmin/properties/${itemId}`);
    }
  };

  render() {
    const { title, colDefs } = this.props;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();

    return (
      <Container>
        <Grid container justify="space-between">
          <Grid item>
            <SectionTitle>{title}</SectionTitle>
          </Grid>
          <Grid item xs={12} sm={12}>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={data.length}
              rowsPerPage={rowsPerPage}
              page={page}
              labelDisplayedRows={({ from, to, count }) => `${from} - ${to}  of ${count}`}
              backIconButtonProps={{
                'aria-label': 'Previous Page',
              }}
              nextIconButtonProps={{
                'aria-label': 'Next Page',
              }}
              onChangePage={(e, newPage) => this.handleChange('page', newPage)}
              onChangeRowsPerPage={e => this.handleChange('rowsPerPage', e.target.value)}
            />
          </Grid>
        </Grid>
        <Table
          colDefs={colDefs}
          data={data}
          order={order}
          orderBy={orderBy}
          rowsPerPage={rowsPerPage}
          page={page}
          onChange={this.handleStateChange}
          onClickRow={this.handleRowClick}
        />
      </Container>
    );
  }
}

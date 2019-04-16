import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';

import Table from 'components/Table';
import Segment from 'components/Segment';
import TablePagination from 'components/TablePagination';


const Container = styled.div`
  margin-top: 2rem;
  color: black;
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const SubTitle = styled.div`
  font-size: 12px;
`;

const DateTitle = styled.div`
  font-size: 12px;
  font-style: italic;
  margin-bottom: 15px;
`;

const TableContainer = styled.div`
  overflow-x: scroll;
`;

export default class ReportCSVTable extends React.PureComponent {
  static propTypes = {
    formData: PropTypes.object.isRequired,
    tableData: PropTypes.object,
  };

  state = {
    order: 'asc',
    orderBy: 'name',
    page: 0,
    rowsPerPage: 10,
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  sortAndFilterArray = () => {
    const { csvData } = this.props.formData;
    const itemsWithId = csvData.tableBody.map((item, id) => ({
      id,
      ...item
    }))
    const { order, orderBy } = this.state;
    return _.orderBy(itemsWithId, [orderBy], [order]);
  }

  handleChange = (key, value) => {
		this.setState({ [key]: value });
  }

  render() {
    const { csvData, title, reportType, properties } = this.props.formData;
    if (!csvData) {
      return null
    }
    console.log('DATA', this.props.formData)
    const { colDefs } = csvData;
    const { order, orderBy, rowsPerPage, page } = this.state;
    const data = this.sortAndFilterArray();
    const subTitle = properties.map(p => p.label).join(', ')
    const dateTitle = `Current customers as of ${moment().format('dddd, MMMM DD, YYYY')}`
    return (
      <Container>
        <Title>{reportType}</Title>
        <SubTitle>{subTitle}</SubTitle>
        <DateTitle>{dateTitle}</DateTitle>
        <TableContainer>
          <Table
            csvFormat
            colDefs={colDefs}
            data={data}
            order={order}
            orderBy={orderBy}
            rowsPerPage={rowsPerPage}
            page={page}
            onChange={this.handleStateChange}
          />
        </TableContainer>
        <div>
          <TablePagination
            rowsPerPageOptions={[10, 25]}
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
        </div>
      </Container>
    );
  }
}



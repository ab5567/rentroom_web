import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { Container as StyledContainer } from 'styled-minimal';

import DropdownSelect from 'components/DropdownSelect';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import OutlinedInput from '@material-ui/core/OutlinedInput';
import TablePagination from '@material-ui/core/TablePagination';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchRounded from '@material-ui/icons/SearchRounded';

const Wrapper = styled.div`
  height: 80px;
`;

const Container = styled(StyledContainer)`
  display: flex;
  align-items: center;
  height: 100%;
`; 

const StyledInput = styled(OutlinedInput)`
  &&& {
    input {
      font-size: 1.4rem;
      padding-top: 1.5rem;
      padding-bottom: 1.5rem;
    }
  }
`;

const StyledTablePagination = styled(TablePagination)`
  &&& {
    div {
      font-size: 1.4rem;
    }
    span {
      font-size: 1.4rem;
    }
  }
`;


const FloatRightWrapper = styled.div`
  margin-left: auto;
`;


class SearchSection extends React.PureComponent {
  static propTypes = {
    allLocationArray: PropTypes.array,
    allStatusArray: PropTypes.array,
    allLeaseEndArray: PropTypes.array,
    rowsLength: PropTypes.number,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    allLocationArray: [],
    allStatusArray: [],
    allLeaseEndArray: [],
  }

  state = {
    location: '',
    status: '',
    leaseEnd: '',
    searchTerm: '',
    page: 1,
    rowsPerPage: 10,
  }


  handleChange = (key, value) => {
		this.setState({ [key]: value }, () => {
      this.props.onChange(this.state);
    });
  }

  render() {
    const { allLocationArray, allStatusArray, allLeaseEndArray, rowsLength } = this.props;
    const { page, rowsPerPage, searchTerm } = this.state;

    return (
      <Wrapper>
        <Container>
          <DropdownSelect 
              placeholder="Location"
              dataItems={allLocationArray}
              onChange={location => this.handleChange('location', location)}
          />
          <DropdownSelect 
              placeholder="Status"
              dataItems={allStatusArray}
              onChange={status => this.handleChange('status', status)}
          />
          <DropdownSelect 
              placeholder="Lease End"
              dataItems={allLeaseEndArray}
              onChange={leaseEnd => this.handleChange('leaseEnd', leaseEnd)}
          />
          <FormControl>
            <StyledInput
              id="input-with-icon-adornment"
              labelWidth={0}
              value={searchTerm}
              onChange={e => this.handleChange('searchTerm', e.target.value)}
              startAdornment={
                <InputAdornment 
                  position="start">
                  <SearchRounded />
                </InputAdornment>
              }
            />
          </FormControl>
          <FloatRightWrapper>
            <StyledTablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rowsLength}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{
                'aria-label': 'Previous Page',
              }}
              nextIconButtonProps={{
                'aria-label': 'Next Page',
              }}
              onChangePage={(e, newPage) => this.handleChange('page', newPage)}
              onChangeRowsPerPage={e => this.handleChange('rowsPerPage', e.target.value)}
            />
          </FloatRightWrapper>
        </Container>
      </Wrapper>
    );
  }
}

export default SearchSection;
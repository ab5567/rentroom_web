import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Container as StyledContainer } from 'styled-minimal';

import DropdownSelect from 'components/DropdownSelect';
import FormControl from '@material-ui/core/FormControl';

import OutlinedInput from '@material-ui/core/OutlinedInput';
import TablePagination from 'components/TablePagination';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchRounded from '@material-ui/icons/SearchRounded';

const Wrapper = styled.div`
  min-height: 80px;
`;

const Container = styled(StyledContainer)`
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 80px;
  flex-wrap: wrap;
`; 

const SearchWrapper = styled(FormControl)`
  &&& {
    margin: 0.5rem 0 0.5rem 1rem;
  }
`;

const StyledInput = styled(OutlinedInput)`
  &&& {
    input {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }
`;

const FloatRightWrapper = styled.div`
  margin-left: auto;
`;

class SearchSection extends React.PureComponent {
  static propTypes = {
    rowsLength: PropTypes.number,
    onChange: PropTypes.func,
    sortColDefs: PropTypes.array
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
    const { rowsLength, sortColDefs } = this.props;
    const { page, rowsPerPage, searchTerm } = this.state;

    return (
      <Wrapper>
        <Container>
          {
            sortColDefs.map((sortCol, index) => 
              <DropdownSelect 
                key={sortCol.id}
                placeholder={sortCol.label}
                dataItems={sortCol.array}
                onChange={item => this.handleChange(sortCol.id, item)}
              />
            )
          }
          <SearchWrapper>
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
          </SearchWrapper>
          <FloatRightWrapper>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rowsLength}
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
          </FloatRightWrapper>
        </Container>
      </Wrapper>
    );
  }
}

export default SearchSection;

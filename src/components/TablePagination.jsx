import React from 'react';
import styled from 'styled-components';
import TablePagination from '@material-ui/core/TablePagination';

const StyledTablePagination = styled(TablePagination)`
  &&& {
    & > div:first-of-type {
      flex-wrap: wrap;
    } 
    div {
      font-size: 1rem;
    }
    span {
      font-size: 1rem;
    }
    svg {
      right: -0.3rem;
      top: 0.2rem;
    }
  }
`;

export default StyledTablePagination;

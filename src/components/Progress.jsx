import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

const Container = styled.div`
  display: ${props => props.loading ? 'flex': 'none'};
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
`;

const Progress = (props) => (
  <Container loading={props.loading}>
    <CircularProgress />
  </Container>
);

export default Progress;
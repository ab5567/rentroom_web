import React from 'react';
import styled from 'styled-components';
import FormLabel from '@material-ui/core/FormLabel';

const Label = styled(FormLabel)`
  &&& {
    margin-top: 1rem;
  }
`;

const ErrorLabel = (props) => 
  <Label 
    {...props}
    error
  />

export default ErrorLabel;

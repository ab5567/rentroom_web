import React from 'react';
import TextField from '@material-ui/core/TextField';
import { STATES } from 'constants/index';

const StateOptions = ['', ...STATES].map(state => {
  return {
    label: state,
    value: state,
  }
});

const StateInput = (props) => (
  <TextField
    {...props}
    id="standard-select-state-native"
    select
    SelectProps={{
      native: true,
    }}
    margin="dense"
  >
    {StateOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </TextField>
);

export default StateInput;

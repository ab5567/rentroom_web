import React from 'react';
import TextField from '@material-ui/core/TextField';
import { CITIES } from 'constants/index';

const CityOptions = ['', ...CITIES].map(city => {
  return {
    label: city,
    value: city,
  }
});

const CityInput = (props) => (
  <TextField
    {...props}
    id="standard-select-city-native"
    select
    SelectProps={{
      native: true,
    }}
    margin="dense"
  >
    {CityOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </TextField>
);

export default CityInput;

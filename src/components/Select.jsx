import React from 'react';
import TextField from '@material-ui/core/TextField';

const Select = ({ options, ...props }) => {
  const selectOptions = options.map(value => ({
    label: value,
    value,
  }));

  return (
    <TextField
      {...props}
      select
      SelectProps={{
        native: true,
      }}
      margin="dense"
    >
      {selectOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  );
};

export default Select;

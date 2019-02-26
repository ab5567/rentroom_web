import React from 'react';
import NumberFormat from 'react-number-format';
import TextField from '@material-ui/core/TextField';


function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.floatValue,
          },
        });
      }}
      thousandSeparator
      prefix="$"
    />
  );
}


const CurrencyInput = (props) => (
  <TextField
    {...props}
    margin="dense"
    InputProps={{
      inputComponent: NumberFormatCustom,
    }}
  />
);

export default CurrencyInput;

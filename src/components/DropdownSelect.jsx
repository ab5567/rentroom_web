import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';

const StyledSelect = styled(Select)`
  &&& {
    // font-size: 1.4rem;
    min-width: 8rem;
    margin: 0.5rem 0 0.5rem 1rem;
  }
`;

export class DropdownSelect extends React.PureComponent {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    dataItems: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  };

  state = {
    currentValue: ''
  }

  handleChange = (e) => {
    const currentValue = e.target.value;
    this.setState({ currentValue });
    this.props.onChange(currentValue);
  }

  render() {
    const { dataItems, placeholder } = this.props;
    const { currentValue } = this.state;

    const rowItems = [
      { title: placeholder, value: '' },
      ...dataItems.map(item => {
        return {
          title: item,
          value: item
        }
      })
    ];

    return (
      <FormControl>
        <StyledSelect
          value={currentValue}
          onChange={this.handleChange}
          displayEmpty
        >
          {
            rowItems.map(item =>
              <MenuItem 
                key={item.value}
                value={item.value} 
                // disabled={item.value === ''}
              >
                {item.title}
              </MenuItem>
            )
          }
        </StyledSelect>
      </FormControl>
    );
  }
}



export default DropdownSelect;

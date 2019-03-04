import React from 'react';
import styled from 'styled-components';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import moment from 'moment';
import { capitalizeFirstLetter } from 'modules/helpers';
import _ from 'lodash';

const StyledSelect = styled(Select)`
  &&& {
  }
`;

const years = [2018, 2019];

const getMonths = () => {
  const months = [];
  years.forEach(year => {
    moment.monthsShort('-MMM-').forEach((month, index) => {
      const now = new Date();
      const currentMonthIndex = now.getMonth();
      const currentYear = now.getFullYear();
      if (year !== currentYear || index <= currentMonthIndex) {
        months.push({
          label: `${month} ${year}`,
          value: `${capitalizeFirstLetter(month)}${year}`
        })
      }
    })
  })
  return _.reverse(months);
}

export class MonthSelect extends React.PureComponent {

  render() {
    return (
        <StyledSelect
          {...this.props}
          native
        >
          {
            getMonths().map(month =>
              <option key={month.value} value={month.value}>{month.label}</option>
            )
          }
        </StyledSelect>
    );
  }
}



export default MonthSelect;

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import moment from 'moment';
import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import CurrencyInput from 'components/CurrencyInput';
import Select from 'components/Select';
import ErrorLabel from 'components/ErrorLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { FIRE_DATA_PATHS, getFirebasePaths } from 'constants/index';
import { FormControl } from '@material-ui/core';

const TextFieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;

  label {
    width: 9rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }
`;

const CheckBox = styled(Checkbox)`
  &&& {
    margin-left: -2.6rem;
  }
`;

const LogTypes = ['Expense', 'Revenue'];
const ExpenseTypes = [
  'Real Estate Taxes',
  'Property Management',
  'Repairs and Maintenance',
  'Insurance',
  'Utilities',
  'Interest',
  'Misc.',
  'Custom',
];
const RevenueTypes = [
  'Parking Fees',
  'Pet Fees',
  'Application Fees',
  'Expense Reimbursement',
  'Rental Income',
  'Custom',
];

const ExpenseColDefs = [
  { id: 'logType', label: 'Log Type', type: 'logType', editable: true },
  { id: 'name', label: 'Expense Name', type: 'text', editable: true },
  { id: 'type', label: 'Expense Type', type: 'type', editable: true },
  { id: 'customType', label: 'Custom Type', type: 'text', editable: true },
  { id: 'amount', label: 'Amount', type: 'currency', editable: true },
  { id: 'date', label: 'Expense Date', type: 'date', editable: true },
  { id: 'reoccuring', label: 'Reoccurring', type: 'check', editable: false },
];

const RevenueColDefs = [
  { id: 'logType', label: 'Log Type', type: 'logType', editable: true },
  { id: 'name', label: 'Revenue Name', type: 'text', editable: true },
  { id: 'type', label: 'Revenue Type', type: 'type', editable: true },
  { id: 'customType', label: 'Custom Type', type: 'text', editable: true },
  { id: 'amount', label: 'Amount', type: 'currency', editable: true },
  { id: 'date', label: 'Revenue Date', type: 'date', editable: true },
  { id: 'reoccuring', label: 'Reoccurring', type: 'check', editable: false },
];

const initialData = {
  logType: LogTypes[0],
  name: '',
  type: ExpenseTypes[0],
  customType: '',
  amount: 0,
  date: moment().format('YYYY-MM-DD'),
  reoccuring: false,
};

export class AddExpenseRevenueModal extends React.PureComponent {
  static propTypes = {
    data: PropTypes.object,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    open: PropTypes.bool.isRequired,
    propertyId: PropTypes.string.isRequired,
  };

  state = {
    data: this.props.data || initialData,
    error: null,
  };

  constructor(props) {
    super(props);
    this.setInitialState(props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      this.setInitialState(this.props);
    }
  }

  setInitialState = props => {
    if (props.data) {
      const data = { ...props.data };
      const { type } = props.data;
      const { logType } = props.data;
      const mainTypes = logType === 'Expense' ? ExpenseTypes : RevenueTypes;
      if (!mainTypes.includes(type)) {
        data.type = 'Custom';
        data.customType = type;
      } else {
        data.customType = '';
      }
      this.setState({ data });
    } else {
      this.setState({
        data: initialData,
      });
    }
  };

  handleChange = key => event => {
    const value = key === 'reoccuring' ? event.target.checked : event.target.value;
    const newData = { [key]: { $set: value } };
    if (key === 'logType') {
      const newType = value === 'Expense' ? ExpenseTypes[0] : RevenueTypes[0];
      newData.type = { $set: newType };
    }
    const newState = update(this.state, {
      data: newData,
      error: { $set: null },
    });
    this.setState(newState);
  };

  validation = () => {
    let valid = true;
    const isRevenueMode = this.state.data.logType === 'Revenue';
    const colDefs = isRevenueMode ? RevenueColDefs : ExpenseColDefs;
    colDefs[3].editable = this.state.data.type === 'Custom'; // if type is Custom, should check validation for customType

    const validationCols = colDefs.filter(col => col.editable);
    validationCols.forEach(col => {
      const filledItem = this.state.data[col.id];
      if (!filledItem) {
        this.setState({ error: `${col.label} is empty.` });
        valid = false;
      }
    });
    return valid;
  };

  handleSave = () => {
    if (!this.validation()) {
      return;
    }

    const { customType, ...serverData } = this.state.data;
    if (serverData.type === 'Custom') {
      serverData.type = customType;
    }

    const { data, propertyId, user } = this.props;
    let id;
    if (!data) {
      id = firebaseDatabase
        .ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/accounts`)
        .push().key;
    } else {
      id = data.id;
    }

    const ref = firebaseDatabase.ref(
      `${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/accounts/${id}`,
    );
    ref.update(serverData).then(error => {
      this.handleClose();
      if (error) {
        console.log('Save Error', error);
      }
    });
  };

  handleClose = () => {
    this.setState({ error: null });
    this.props.onClose();
  };

  renderInput = colDef => {
    const isRevenueMode = this.state.data.logType === 'Revenue';
    const Types = isRevenueMode ? RevenueTypes : ExpenseTypes;
    const value = this.state.data[colDef.id];
    switch (colDef.id) {
      case 'logType':
        return (
          <Select
            options={LogTypes}
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        );
      case 'type':
        return (
          <Select
            options={Types}
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        );
      case 'amount':
        return (
          <CurrencyInput
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        );
      case 'reoccuring':
        return (
          <CheckBox
            color="primary"
            checked={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
          />
        );
      default:
        return (
          <TextField
            id={colDef.id}
            margin="dense"
            disabled={!colDef.editable}
            type={colDef.type}
            value={value}
            onChange={this.handleChange(colDef.id)}
            fullWidth
          />
        );
    }
  };

  render() {
    const { open } = this.props;
    const { error, data } = this.state;

    if (!data) {
      return null;
    }

    const isRevenueMode = data.logType === 'Revenue';
    const colDefs = isRevenueMode ? RevenueColDefs : ExpenseColDefs;
    const isCustomType = this.state.data.type === 'Custom';

    return (
      <Modal open={open} onClose={this.handleClose} fullWidth maxWidth="md">
        <ModalTitle>{this.props.data ? 'Edit' : 'Add'} Expense or Revenue</ModalTitle>
        <ModalContent>
          {colDefs
            .filter(colDef => colDef.label)
            .map(colDef =>
              !isCustomType && colDef.id === 'customType' ? null : (
                <TextFieldWrapper key={colDef.id}>
                  <label>{colDef.label}</label>
                  {this.renderInput(colDef)}
                </TextFieldWrapper>
              ),
            )}
          {error && <ErrorLabel>{error}</ErrorLabel>}
        </ModalContent>
        <ModalActions onClose={this.handleClose} onSave={this.handleSave} />
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(AddExpenseRevenueModal);

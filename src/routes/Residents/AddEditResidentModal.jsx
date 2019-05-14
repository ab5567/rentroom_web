import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';
import { connect } from 'react-redux';

import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import { getFirebasePaths } from 'constants/index';
import CurrencyInput from 'components/CurrencyInput';
import PhoneInput from 'components/PhoneInput';
import StateInput from 'components/StateInput';
import CityInput from 'components/CityInput';
import ErrorLabel from 'components/ErrorLabel';
import axios from 'axios';

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

const ColDefs = [
  { id: 'name', label: 'Resident Name', type: 'text', editable: true },
  { id: 'monthlyRent', label: 'Monthly Rent', type: 'text', editable: true },
  { id: 'lease start', label: 'Lease Start', type: 'date', editable: true },
  { id: 'lease end', label: 'Lease End', type: 'date', editable: true },
  { id: 'lease link', label: 'Lease Link', type: 'text', editable: true },
  { id: 'price', label: 'Price', type: 'currency', editable: true },
  { id: 'email', label: 'Email', type: 'email', editable: true },
  { id: 'phone', label: 'Phone', type: 'phone', editable: true },
  { id: 'state', label: 'State', type: 'state', editable: true },
  { id: 'city', label: 'City', type: 'city', editable: true },
  { id: 'image', label: null, type: 'image', editable: false },
  { id: 'id', label: 'ID', type: 'text', editable: false },
];


export class AddEditResidentModal extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    data: PropTypes.object,
    onSave: PropTypes.func,
    onClose: PropTypes.func
  };

  state = {
    isLoading: false,
    data: this.props.data || {},
    error: null
  }

  componentDidUpdate(prevProps) {
		if (this.props.open && !prevProps.open) {
      this.setState({ data: this.props.data });
		}
  }
  

  renderInput = (colDef) => {
    const value = this.state.data[colDef.id];
    switch(colDef.type) {
      case 'currency':
        return (
          <CurrencyInput
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        )
      case 'phone':
        return (
          <PhoneInput
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        )
      case 'state':
        return (
          <StateInput
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        )
      case 'city':
        return (
          <CityInput
            value={value}
            onChange={this.handleChange(colDef.id)}
            id={colDef.id}
            fullWidth
          />
        )
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
        )
    }
  }

  handleChange = key => event => {
    const newState = update(this.state, {
      data: {[key]: {$set: event.target.value}},
      error: {$set: null},
    });
    this.setState(newState);
  };

  validation = () => {
    let valid = true;
    const validationCols = ColDefs.filter(col => col.editable);
    validationCols.forEach(col => {
      const filledItem = this.state.data[col.id];
      if (!filledItem) {
        this.setState({ error: `${col.label} is empty.` });
        valid = false;
        return;
      }
    })
    return valid;
  }


  handleSave = () => {
    if (!this.validation()) {
      return;
    }
    let id = this.props.data.id;
    const { user } = this.props;
    const propertyId = this.state.data.address

    if (!id) {
      id = firebaseDatabase.ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/residents`).push().key;
    }

    const savingData = _.omit(this.state.data, ['paymentHistory', 'image']);
    // if (data.uid) {
    //   const ref = firebaseDatabase.ref(`${getFirebasePaths(user.uid).RESIDENTS}/${data.uid}`);
    //   ref.update(savingData).then((error) => {
    //     if (error) {
    //       console.log('Save Error', error);
    //       return;
    //     }
    //   });
    // }

    const ref = firebaseDatabase.ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/residents/${id}`);
    ref.update(savingData).then((error) => {
      this.handleClose();
      if (error) {
        console.log('Save Error', error);
        return;
      }
    });

  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { error } = this.state;
    const { open } = this.props;

    return (
        <Modal
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="md"
        >
          <ModalTitle>Edit Resident</ModalTitle>
          <ModalContent>
            {
              ColDefs.filter(colDef => colDef.label).map(colDef => 
                <TextFieldWrapper key={colDef.id}>
                  <label>{colDef.label}</label>
                  {this.renderInput(colDef)}
                </TextFieldWrapper>
              )
            }
           {error && <ErrorLabel>{error}</ErrorLabel>}
          </ModalContent>
          <ModalActions
            onClose={this.handleClose}
            onSave={this.handleSave}
          />
        </Modal>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(AddEditResidentModal);

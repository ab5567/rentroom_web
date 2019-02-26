import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';

import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import { FIRE_DATA_PATHS } from 'constants/index';
import CurrencyInput from 'components/CurrencyInput';
import PhoneInput from 'components/PhoneInput';
import StateInput from 'components/StateInput';
import CityInput from 'components/CityInput';

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
  { id: 'image', label: null, type: 'image', editable: true },
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
    data: this.props.data || {}
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
    const newState = update(this.state, {data: {[key]: {$set: event.target.value}}});
    this.setState(newState);
  };

  handleSave = () => {
    let id = this.props.data.id;
    if (!id) {
      id = firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENTS).push().key;
      console.log('New Key', id);
    } 
    const ref = firebaseDatabase.ref(`${FIRE_DATA_PATHS.RESIDENTS}/${id}`);
    ref.update(this.state.data).then((error) => {
      this.handleClose();
      if (error) {
        console.log('Save Error', error);
        return;
      }
      this.props.onSave();
    });;
  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { isLoading } = this.state;
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
          </ModalContent>
          <ModalActions
            onClose={this.handleClose}
            onSave={this.handleSave}
          />
        </Modal>
    );
  }
}

export default AddEditResidentModal;


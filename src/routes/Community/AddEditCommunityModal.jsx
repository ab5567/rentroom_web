import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';

import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import { getFirebasePaths } from 'constants/index';
import CityInput from 'components/CityInput';
import ErrorLabel from 'components/ErrorLabel';

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
  { id: 'name', label: 'Name', type: 'text', editable: true },
  { id: 'text', label: 'Text', type: 'text', editable: true },
  { id: 'city', label: 'City', type: 'city', editable: true },
  { id: 'date', label: 'Date', type: 'date', editable: true },
  { id: 'userId', label: 'User ID', type: 'text', editable: false },
  { id: 'timestamp', label: null, type: 'text', editable: false },
];

export class AddEditCommunityModal extends React.PureComponent {
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
    const { user } = this.props;
    const firebasePath = getFirebasePaths(user.uid);
    let id = this.props.data.id;
    if (!id) {
      id = firebaseDatabase.ref(firebasePath.COMMUNITY).push().key;
      console.log('New Key', id);
    } 
    const ref = firebaseDatabase.ref(`${firebasePath.COMMUNITY}/${id}`);
    ref.update(this.state.data).then((error) => {
      this.handleClose();
      if (error) {
        console.log('Save Error', error);
        return;
      }
      this.props.onSave();
    });
  }

  handleClose = () => {
    this.setState({ error: null })
    this.props.onClose();
  }

  render() {
    const { isLoading, error } = this.state;
    const { open, data } = this.props;
    return (
        <Modal
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="md"
        >
          <ModalTitle>{`${data.id ? 'Edit' : 'New'} Community Post`}</ModalTitle>
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

export default connect(mapStateToProps)(AddEditCommunityModal);



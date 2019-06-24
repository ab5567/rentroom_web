import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles'

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
import Select from 'components/Select';
import PropertySelect from 'components/PropertySelect';

import { showAlert } from 'actions/index';

const styles = theme => ({
  root: {
    overflow: 'visible'
  }
})


const TextFieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;

  label {
    min-width: 6rem;
    max-width: 6rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }
`;

const EditColDefs = [
  { id: 'name', label: 'Name', type: 'text', editable: true },
  { id: 'role', label: 'Role', type: 'role', editable: true },
  { id: 'email', label: 'Email', type: 'email', editable: true },
  { id: 'phone', label: 'Phone', type: 'phone', editable: true },
  { id: 'properties', label: 'Properties', type: 'properties', editable: true }
];

const NewColDefs = [
  { id: 'name', label: 'Name', type: 'text', editable: true },
  { id: 'role', label: 'Role', type: 'role', editable: true },
  { id: 'email', label: 'Email', type: 'email', editable: true },
  { id: 'properties', label: 'Properties', type: 'properties', editable: true }
];

const Roles = [
  'Owner', 
  'Maintenance'
];

export class AddUserModal extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    data: PropTypes.object,
    onSave: PropTypes.func,
    onClose: PropTypes.func
  };

  state = {
    isLoading: false,
    data: this.props.data,
    error: null
  }

  componentDidUpdate(prevProps) {
    if (this.props.open && !prevProps.open) {
      const formData = {...this.props.data}
      if (formData.properties) {
        formData.properties = formData.properties.split(',').map(p => ({
          label: p,
          value: p
        }))
      } else {
        formData.properties = [];
      }
      this.setState({ data: formData });
    }
  }
  
  renderInput = (colDef) => {
    const { isPropertiesLoaded, allProperties } = this.props;
    const value = this.state.data[colDef.id];
    let suggestions = []
    if (isPropertiesLoaded) {
      suggestions = allProperties.map(p => ({
        value: p.id,
        label: p.name,
      }))
    }
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
      case 'properties':
        return (
          <PropertySelect
            placeholder=' '
            suggestions={suggestions}
            value={value}
            onChange={this.handleChange('properties')}
          />
        )
      case 'role':
        return (
          <Select
            options={Roles}
            value={value}
            onChange={this.handleChange(colDef.id)}
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
    let newValue
    if (key === 'properties') {
      newValue = event
    } else {
      newValue = event.target.value
    }

   const newState = update(this.state, {
      data: {[key]: {$set: newValue}},
      error: {$set: null},
    });

    this.setState(newState);
  };

  validation = () => {
    let id = this.props.data.id;
    const colDefs = !!id ? EditColDefs : NewColDefs
    let valid = true;
    const validationCols = colDefs.filter(col => col.editable);
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
    const { data } = this.state;
    const { email, role, properties, name } = data;
    const propertyGroup = user.property_groups;
    const propertiesString = properties.map(p => p.value).toString();

    if (!id) {
      // const url = 'http://localhost:8080/public/send-pre-approval-link-email';
      const url = 'https://us-central1-rentroom-dev.cloudfunctions.net/sendAdminSignupEmail'
      // const link = `http://localhost:3000/admin-signup?email=${email}&property_group=${propertyGroup}&role=${role}&properties=${propertiesString}`;
      const link = `https://rentroom-dev.firebaseio.com/admin-signup?email=${email}&property_group=${propertyGroup}&role=${role}&properties=${propertiesString}`

      axios.post(url, {
        email,
        name,
        role,
        link,
        property_group: propertyGroup
      })
      .then(response => {
        const { dispatch } = this.props;
        dispatch(showAlert('Sign up email was sent successfully.', { variant: 'success', icon: 'bell' }));
        this.handleClose();
      })
      .catch((error) => {
        console.log(error);
        const {dispatch } = this.props;
        dispatch(showAlert('Failed to send sign up email.', { variant: 'danger', icon: 'bell' }));
      });
    } else {
      const savingData = _.omit(data, ['id']);
      savingData.properties = data.properties.map(p => p.value).toString();
      const ref = firebaseDatabase.ref(`admins/${id}`);
      ref.update(savingData).then((error) => {
        if (error) {
          console.log('Save Error', error);
          return;
        }
        this.handleClose();
      });
    }
  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { error } = this.state;
    const { open, data, classes } = this.props;
    const isNew = !data.id;
    const colDefs = isNew ? NewColDefs : EditColDefs

    return (
        <Modal
          classes={{ paperScrollPaper: classes.root }}
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="md"
        >
          <ModalTitle>{isNew ? 'Add User' : 'Edit User'}</ModalTitle>
          <ModalContent className={classes.root}>
            {
              colDefs.filter(colDef => colDef.label).map(colDef => 
                <TextFieldWrapper key={colDef.id}>
                  <label>{colDef.label}</label>
                  {this.renderInput(colDef)}
                </TextFieldWrapper>
              )
            }
           {error && <ErrorLabel>{error}</ErrorLabel>}
          </ModalContent>
          <ModalActions
            actionTitle={isNew ? 'Add' : 'Update'}
            onClose={this.handleClose}
            onSave={this.handleSave}
          />
        </Modal>
    );
  }

  static defaultProps = {
    data: {
      role: 'Owner'
    }
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    user: state.user,
    isPropertiesLoaded: state.data.isPropertiesLoaded,
    allProperties: state.data.properties
  };
}

const wStyle = withStyles(styles)(AddUserModal)


export default connect(mapStateToProps)(wStyle);

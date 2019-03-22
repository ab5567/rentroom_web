import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';
import { connect } from 'react-redux';

import { firebaseDatabase, firebaseStorage } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import { getFirebasePaths } from 'constants/index';
import Button from 'components/Button';
import StateInput from 'components/StateInput';
import CityInput from 'components/CityInput';
import ErrorLabel from 'components/ErrorLabel';


const TextFieldWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;

  label {
    min-width: 8rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }
`;

const ImageWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 1rem;

  & > label {
    min-width: 8rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }

  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      height: 10rem;
      box-shadow: 0 3px 4px 0 rgba(16, 27, 79, 0.2);
      border-radius: 1rem;
      margin-bottom: 1rem;
    }

    input {
      display: none;
    }
  }
`;


const AddColDefs = [
  { id: 'image', label: 'Image', type: 'image', editable: true },
  { id: 'location', label: 'Location', type: 'text', editable: true },
  { id: 'state', label: 'State', type: 'state', editable: true },
  { id: 'city', label: 'City', type: 'city', editable: true },
];

const EditColDefs = [
  { id: 'image', label: 'Image', type: 'image', editable: true },
  { id: 'state', label: 'State', type: 'state', editable: true },
  { id: 'city', label: 'City', type: 'city', editable: true },
];

export class EditPropertyModal extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    propertyId: PropTypes.string,
    data: PropTypes.object,
    onSave: PropTypes.func,
    onClose: PropTypes.func
  };

  state = {
    loading: false,
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
      case 'text': 
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
    const colDefs = this.props.propertyId ? EditColDefs : AddColDefs;
    const validationCols =  colDefs.filter(col => col.editable);
    validationCols.forEach(col => {
      const filledItem = this.state.data[col.id];
      if (!filledItem) {
        console.log('Missing Item', col);
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
    const { propertyId, onSave, user } = this.props; 
    if (propertyId) {
      const ref = firebaseDatabase.ref(`${getFirebasePaths(user.uid).PROPERTIES}/${propertyId}/building `);
      ref.update(this.state.data).then((error) => {
        this.handleClose();
        if (error) {
          console.log('Save Error', error);
          return;
        }
        if (onSave) {
          onSave()
        }
      });
    } else {
      const { location, city, image, state } = this.state.data;
      const newProperty = {
        [location]: {
          'building ': {
              city,
              image,
              state
            },
          residents: []
        }
      }
      const ref = firebaseDatabase.ref(getFirebasePaths(user.uid).PROPERTIES);
      ref.update(newProperty).then((error) => {
        this.handleClose();
        if (error) {
          console.log('Save Error', error);
          return;
        }
      });
    }

  }

  handleImageSelect = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    this.setState({ loading: true });
    reader.onloadend = () => {
      this.submitImageToFirebase(reader.result)
    }
    reader.readAsDataURL(file)
  }

  submitImageToFirebase(value){
    var storageRef = firebaseStorage.ref();
    var refFile = new Date().getTime() + ".jpg"

    var newImageRef = storageRef.child(refFile);
    var stripedImage= value.substring(value.indexOf('base64') + 7, value.length);
    newImageRef.putString(stripedImage, 'base64').then((snapshot) => {
      newImageRef.getDownloadURL().then((downloadURL) => {
        const newState = update(this.state, {data: {image: {$set: downloadURL}}});
        this.setState({
          ...newState,
          loading: false
        });
      });
    });
  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { loading, data, error } = this.state;
    const { open, propertyId } = this.props;
    const colDefs = propertyId ? EditColDefs.slice(1) : AddColDefs.slice(1);
    const title = propertyId ? `Edit Property: ${propertyId}` : 'Add Property';
    
    return (
        <Modal
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="md"
        >
          <Progress loading={loading}/>
          <ModalTitle>{title}</ModalTitle>
          <ModalContent>
            <ImageWrapper>
              <label>Image</label>
              <div>
                <img src={data.image}/>
                <input
                  accept="image/*"
                  id="text-button-file"
                  type="file"
                  onChange={this.handleImageSelect}
                />
                <label htmlFor="text-button-file">
                  <Button variant="contained" color="default" component="span">
                    Select Image
                  </Button>
                </label>
              </div>
            </ImageWrapper>

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

export default connect(mapStateToProps)(EditPropertyModal);

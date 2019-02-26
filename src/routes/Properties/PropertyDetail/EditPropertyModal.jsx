import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import update from 'immutability-helper';

import { firebaseDatabase, firebaseStorage } from 'config/firebase';
import TextField from '@material-ui/core/TextField';
import Modal, { ModalTitle, ModalContent, ModalActions } from 'components/Modal';
import Progress from 'components/Progress';
import { FIRE_DATA_PATHS } from 'constants/index';
import Button from 'components/Button';
import StateInput from 'components/StateInput';
import CityInput from 'components/CityInput';

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


const ColDefs = [
  { id: 'state', label: 'State', type: 'state', editable: true },
  { id: 'city', label: 'City', type: 'city', editable: true },
  { id: 'image', label: null, type: 'image', editable: true },
];

export class EditPropertyModal extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    propertyId: PropTypes.string.isRequired,
    data: PropTypes.object,
    onSave: PropTypes.func,
    onClose: PropTypes.func
  };

  state = {
    loading: false,
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
    const { propertyId } = this.props; 
    const ref = firebaseDatabase.ref(`${FIRE_DATA_PATHS.PROPERTIES}/${propertyId}/building `);
    ref.update(this.state.data).then((error) => {
      this.handleClose();
      if (error) {
        console.log('Save Error', error);
        return;
      }
      this.props.onSave();
    });;
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
    const { loading, data } = this.state;
    const { open, propertyId } = this.props;
    
    return (
        <Modal
          open={open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="md"
        >
          <Progress loading={loading}/>
          <ModalTitle>Edit Property: {propertyId}</ModalTitle>
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

export default EditPropertyModal;


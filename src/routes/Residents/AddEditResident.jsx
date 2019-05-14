import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';

import Header from 'containers/Header';
import { firebaseDatabase } from 'config/firebase';
import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';

const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 160px);
  overflow: auto;
`;

const Form = styled.form`
  margin: 3rem 4rem;
`

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
  { id: 'name', label: 'Resident Name', type: 'text' },
  { id: 'monthlyRent', label: 'Monthly Rent', type: 'text' },
  { id: 'lease start', label: 'Lease Start', type: 'date' },
  { id: 'lease end', label: 'Lease End', type: 'date' },
  { id: 'lease link', label: 'Lease Link', type: 'date' },
  { id: 'price', label: 'Price', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'phone', label: 'Phone', type: 'text' },
  { id: 'State', label: 'State', type: 'text' },
  { id: 'City', label: 'City', type: 'text' },
];

export class AddEditResident extends React.PureComponent {
  static propTypes = {

  };

  state = {
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (id === 'new') {
      return;
    }
    const firebasePath = `property_groups/amicus_properties/users/${id}`;
    const ref = firebaseDatabase.ref(firebasePath);
    ref.once('value').then((snapshot) => {
      this.processData(snapshot.val());
    });
  }

  processData = (data) => {
    this.setState(data)
  }

  handleChange = key => event => {
    this.setState({ [key]: event.target.value });
  };

  render() {
    const isNewEntry = (this.props.match.params.id === 'new');
    return (
      <Fragment>
        <Header 
          title={`${isNewEntry ? 'Add' : 'Edit'} Resident`}
        />
        <StyledContainer>
          <Form>
            {
              ColDefs.map(colDef => 
                <TextFieldWrapper>
                  <label>{colDef.label}</label>
                  <TextField
                    key={colDef.id}
                    id={colDef.id}
                    margin="dense"
                    type={colDef.type}
                    value={this.state[colDef.id]}
                    onChange={this.handleChange(colDef.id)}
                    fullWidth
                  />
                </TextFieldWrapper>
              )
            }
          </Form>
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default AddEditResident;


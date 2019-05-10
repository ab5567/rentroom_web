import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';
import moment from 'moment';
import update from 'immutability-helper';

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
  { id: 'name', label: 'Name', type: 'text', editable: true },
  { id: 'text', label: 'Text', type: 'text', editable: true },
  { id: 'city', label: 'City', type: 'text', editable: true },
  { id: 'date', label: 'Date', type: 'date', editable: true },
  { id: 'userId', label: 'User ID', type: 'text', editable: false },
  { id: 'timestamp', label: null, type: 'text', editable: false },
];

export class AddEditCommunity extends React.PureComponent {
  static propTypes = {
  };

  _databaseRef;

  state = {
    isLoading: false,
    data: {}
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (id === 'new') {
      return;
    }

    this.setState({ isLoading: true });
    const firebasePath = `property_groups/amicus_properties/posts/${id}`;
    this._databaseRef = firebaseDatabase.ref(firebasePath);
    this._databaseRef.once('value').then((snapshot) => {
      this.setState({ isLoading: false });
      this.processData(snapshot.val());
    });
  }

  processData = (data) => {
    console.log('Record', data);
    if (!data.date && data.timestamp) {
      const timestamp = Math.round(parseFloat(data.timestamp));
      data.date = moment.unix(timestamp).format('YYYY-MM-DD');
    }
    this.setState({ data })
  }

  handleChange = key => event => {
    console.log('Key', key);
    console.log('Value', event.target.value);

    const newState = update(this.state, {data: {[key]: {$set: event.target.value }}});
    this.setState(newState);
  };

  handleSave = () => {
    console.log('aaa', this.state.data);
    this._databaseRef.update(this.state.data).then((error) => {
      if (error) {
        console.log('Save Error', error);
        return;
      }
      console.log('Success');
    });;
  }

  render() {
    const isNewEntry = (this.props.match.params.id === 'new');
    const { isLoading } = this.state;
    return (
      <Fragment>
        <Header 
          title={`${isNewEntry ? 'Add' : 'Edit'} Community`}
          onSave={this.handleSave}
        />
        <StyledContainer>
          {isLoading 
            ? <CircularProgress />
            : <Form>
                {
                  ColDefs.filter(colDef => colDef.label).map(colDef => 
                    <TextFieldWrapper key={colDef.id}>
                      <label>{colDef.label}</label>
                      <TextField
                        id={colDef.id}
                        margin="dense"
                        disabled={!colDef.editable}
                        type={colDef.type}
                        value={this.state.data[colDef.id]}
                        onChange={this.handleChange(colDef.id)}
                        fullWidth
                      />
                    </TextFieldWrapper>
                  )
                }
              </Form>
            }
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default AddEditCommunity;


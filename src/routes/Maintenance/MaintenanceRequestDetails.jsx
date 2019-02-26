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
import Progress from 'components/Progress';
import Avatar from '@material-ui/core/Avatar';

import { FIRE_DATA_PATHS } from 'constants/index';
import SendIcon from '@material-ui/icons/Send';

const RightArrow = require('assets/media/images/right-arrow.png');


const StyledContainer = styled(Container)`
  text-align: center;
  height: calc(100vh - 100px);
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const TenantInfoSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  padding: 0.5rem 0;
`;

const Name = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-right: 5rem;
`;

const InfoItem = styled.div`
  text-align: left;
  margin-left: 2rem;

  label {
    font-size: 0.9rem;
    color: ${props => props.theme.palette.light};
  }

  div {
    font-size: 1rem;
    color: ${props => props.theme.palette.second};
  }
`;

const MessagesSection = styled.div`
  flex: 1;
  overflow-y: scroll;
`;

const MessageContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: ${props => props.right ? 'flex-end': 'flex-start'};
  margin-bottom: 20px;
`;

const MessageWrapper = styled.div`
  max-width: 60%;
  margin: 0 0.8rem;
  font-weight: 500;
  font-size: 1rem;
  color: white;
  background: ${props => props.right ? props.theme.palette.third : props.theme.palette.primary};
  padding: 0.7rem 1rem;
  border-radius: ${props => props.right ? '1rem': '0'}  ${props => props.right ? '0': '1rem'} 1rem 1rem };
  text-align: left;
  display: flex;
  flex-direction: column;

  img {
    width: 25rem;
    margin: 0.3rem 0;
    border-radius: 0.5rem;
  }
}`;

const DateLabel = styled.div`
  font-size: 0.8rem;
`;

const ChatAvatar = styled(Avatar)`
  box-shadow: 0 3px 4px 0 rgba(16, 27, 79, 0.2);
  width: 1.5rem;
  height: 1.5rem;
`;

const InputContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Input = styled.div`
  display: flex;
  align-items: center;
  border-radius: .5rem;
  box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.5);
  padding: 0.7rem 1rem;
  margin-right: 1rem;
  width: 50%;

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1rem;
    margin-right: 1rem;
    background: transparent;
  }

  button {
    outline: none;
    svg {
      fill: #4b74ff;
    }
  }
`;

export class MaintenanceRequestDetails extends React.PureComponent {
  static propTypes = {
  };

  _databaseRef;

  state = {
    loading: false,
    data: {},
    currentMessage: ''
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    if (id === 'new') {
      return;
    }

    this.setState({ loading: true });

    firebaseDatabase.ref(FIRE_DATA_PATHS.RESIDENT_ADDRESSES).once('value').then((snapshot) => {
      const addresses = snapshot.val();
      this.refreshData(addresses);
    });
  }

  refreshData = (addresses) => {
    const id = this.props.match.params.id;
    const firebasePath = `${FIRE_DATA_PATHS.MAINTENANCE_REQUESTS}/${id}`;
    this._databaseRef = firebaseDatabase.ref(firebasePath);
    this._databaseRef.once('value').then((snapshot) => {
      this.setState({ loading: false });

      if (addresses) {
        let tenant_address = '';
        const tenantID = snapshot.val().uidOfFirebase;
        if (addresses[id]) {
          tenant_address = addresses[id].Address;
        } else if (tenantID && addresses[tenantID]) {
          tenant_address = addresses[tenantID].Address;
        }
        this.setState({ tenant_address });
      }

      this.processData(snapshot.val());
    });
  }

  processData = (data) => {
    console.log('Record', data);
    const { tenant, tenant_email, tenant_phone, subject } = data;
    const messages = [];
    for (var key in data.messages){
      const object = data.messages[key];
      if (object) {
        messages.push(object);
      }
    }
    this.setState({ 
      tenant,
      tenant_email,
      tenant_phone,
      subject,
      messages
    })
  }

  onChange = (e) => {
    this.setState({ currentMessage: e.target.value });
  }

  sendMessage = () => {
    const { currentMessage } = this.state;
    if (!currentMessage) {
      return;
    }
    const requestID = this.props.match.params.id;
    const newMessageID = firebaseDatabase.ref(`${FIRE_DATA_PATHS.MAINTENANCE_REQUESTS}/${requestID}/messages`).push().key;
    const ref = firebaseDatabase.ref(`${FIRE_DATA_PATHS.MAINTENANCE_REQUESTS}/${requestID}/messages/${newMessageID}`);
    const newMsg = {
      sender: this.props.user.uid,
      message: currentMessage,
      timestamp: new Date().getTime() / 1000
    }
    ref.update(newMsg).then((error) => {
      if (error) {
        console.log('Save Error', error);
        return;
      }
      this.setState({ currentMessage: '' });
      this.refreshData();
    });
  };

  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.sendMessage();
    }
  }

  render() {
    const { 
      loading,
      tenant,
      tenant_email,
      tenant_phone,
      subject,
      messages,
      tenant_address,
      currentMessage 
    } = this.state;

    const { user } = this.props;
    return (
      <Fragment>
        <Progress loading={loading}/>
        <Header 
          title="Request Details"
        />
        <StyledContainer>
          <TenantInfoSection>
            <Name>{tenant}</Name>
            {tenant_address &&
              <InfoItem>
                <label>Location</label>
                <div>{tenant_address}</div>
              </InfoItem>
            }
            {tenant_phone &&
              <InfoItem>
                <label>Phone Number</label>
                <div>{tenant_phone}</div>
              </InfoItem>
            }
          </TenantInfoSection>
          <MessagesSection>
            { messages &&
              messages.map(item => {
                const { timestamp, message, photo, sender } = item;
                const right = (sender === user.uid);
                const dateString = moment.unix(Math.round(parseFloat(timestamp))).format('MMM Do, h:mm a');
                return (
                  !right 
                  ?
                  <MessageContainer key={item.timestamp}>
                    <ChatAvatar>{right ? '' : tenant.charAt(0)}</ChatAvatar>
                    <MessageWrapper>
                      {photo && <img src={photo}/>}
                      <div>{message}</div>
                    </MessageWrapper>
                    <DateLabel>{dateString}</DateLabel>
                  </MessageContainer>
                  :
                  <MessageContainer key={item.timestamp} right>
                    <DateLabel>{dateString}</DateLabel>
                    <MessageWrapper right>
                      {photo && <img src={photo}/>}
                      <div>{message}</div>
                    </MessageWrapper>
                    <ChatAvatar>{right ? '' : tenant.charAt(0)}</ChatAvatar>
                  </MessageContainer>
                );
              })
            }
          </MessagesSection>
          <InputContainer>
            <Input>
              <input
                placeholder="Type something"
                value={currentMessage}
                onChange={this.onChange}
                onKeyPress={this._handleKeyPress}
              />
              <button onClick={this.sendMessage}>
                <SendIcon/>
              </button>
            </Input>
          </InputContainer>
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(MaintenanceRequestDetails);

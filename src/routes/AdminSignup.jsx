import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import Button from 'components/Button';
import config from 'config';
import { login, resetLoginFailure } from 'actions/index';
import { utils } from 'styled-minimal';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import PropertySelect from 'components/PropertySelect';
import { authRef, firebaseDatabase } from 'config/firebase'

import EmailIcon from '@material-ui/icons/EmailOutlined';
import LockIcon from '@material-ui/icons/LockOutlined';
import Image from 'assets/media/images/living.jpg';
import Logo from 'assets/media/images/icon.png';


const { spacer } = utils;

const Container = styled.div`
  background: #666666;
`;

const HomeContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

const Card = styled.div`
  width: 60rem;
  padding: 4rem 2rem 2rem;
  background: white;
  border-radius: 0rem;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  button {
    width: 100%;
    height: 50px;
    margin-top: 25px;
  }

  @media(max-width: 575.98px) {
    width: 30rem;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    width: 60rem;
}

`;

const CardBody = styled.div`
  margin-top: 75px;
  margin-left: -390px;
  width: 50%;

  & > div {
    margin-bottom: 1rem;
    display: flex;
    align-items: flex-end;

    svg {
      margin-right: 1rem;
    }

    & > div {
      flex: 1;
      min-width: 18rem;
    }
  }

  @media(max-width: 575.98px) {
    margin-top: 60px;
    margin-left: 0px;
    width: 100%;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    width:45%;
    left: -20rem;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 1rem;
  position: absolute;
  top: 17rem;
`;

const Header = styled.div`
  padding: 15px;
  font-size: 2rem;
  /* background: #4b74ff;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4);
  border-radius: 3px; */
  color: black;
  text-align: left;
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
`;

const ApartmentImage = styled.div`
  padding: 15px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  display: block !important;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media(max-width: 575.98px) {
    margin-top: 0px;
    margin-left: 0x;
    width: 0%;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    margin-top: -46px;
    margin-left: 28x;
  }
`;

const RRLogo = styled.div`
  padding: 15px;
  font-size: 1rem;
  /* background: #4b74ff;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4);
  border-radius: 3px; */
  position: absolute;
  top:0rem;
  left:51rem;
  right: 1rem;
`;

const Subheader = styled.div`
  padding: 15px;
  font-size: 1rem;
  /* background: #4b74ff;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4);
  border-radius: 3px; */
  color: black;
  text-align: left;
  position: absolute;
  top: 3.5rem;
  left: 1rem;
  right: 1rem;
`;

const BottomLabel = styled(Typography)`
  &&& {
    font-size: 12px;
    margin-top: 25px;
    text-align: center;
  }
`;


export class AdminSignup extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  state = {
    name: '',
    password: '',
    confirmPassword: '',
    errorMsg: ''
  }

  handleClickLogin = () => {
    const { user, location } = this.props;
    const { password, confirmPassword, name } = this.state;
    const { email, property_group, role, properties } = location.query

    if (!password || !confirmPassword || !name ) {
      this.setState({ errorMsg: 'Please fill the empty field.' })
      return
    }

    if (password !== confirmPassword) {
      this.setState({ errorMsg: 'Your password and confirmation password do not match.' })
      return
    }

    if (!email || !property_group || !role ) {
      this.setState({ errorMsg: 'Invalid link for sign up.' })
      return
    }

    authRef.createUserWithEmailAndPassword(email, password)
    .then(res => {
      console.log('user', res)
      const uid = res.user.uid
      const newUser = {
          email,
          property_groups: property_group,
          role,
          name,
          properties
        }
      const ref = firebaseDatabase.ref(`admins/${uid}`);
      ref.update(newUser).then((error) => {
        if (error) {
          console.log('Save Error', error);
          return;
        }
        const { dispatch } = this.props;
        dispatch(login(email, password));
      });
    })
    .catch((error) => {
      console.log(error)
      this.setState({ errorMsg: error.message })
    });
  };


  handleChange = key => event => {
    this.setState({
      [key]: event.target.value,
      errorMsg: null
    });
  };

  render() {
    const { user, location } = this.props;
    const { password, confirmPassword, errorMsg, name } = this.state;
    const { email, property_group, role, properties } = location.query
    const propertiesArray = properties.split(',').map(p => ({
      label: p,
      value: p
    }))
    console.log(location)

    return (
      <Container key="Home" data-testid="HomeWrapper">
        <HomeContainer verticalPadding>
          <Card>
            <Header>
              Welcome
            </Header>
            <Subheader>
              Rentroom Management Portal
            </Subheader>
            <CardBody>
              <ApartmentImage>
                <img src={Image} /> 
              </ApartmentImage>
              <RRLogo>
                <img src={Logo} /> 
              </RRLogo>
              <div>
                <EmailIcon />
                <TextField 
                  type="email" 
                  label="Email Address" 
                  value={email}
                  disabled
                />
              </div>
              <div>
                <EmailIcon />
                <TextField 
                  label="Property Group" 
                  value={property_group}
                  disabled
                />
              </div>
              <div>
                <EmailIcon />
                <TextField 
                  label="Role"
                  value={role}
                  disabled
                />
              </div>
              <div>
                <EmailIcon />
                <PropertySelect
                  suggestions={[]}
                  value={propertiesArray}
                  isDisabled
                />
              </div>
              <div>
                <LockIcon />
                <TextField 
                  label="Name" 
                  value={name}
                  onChange={this.handleChange('name')}
                />
              </div>
              <div>
                <LockIcon />
                <TextField 
                  type="password"
                  autoComplete="current-password"
                  id="input-with-icon-grid" 
                  label="Password" 
                  value={password}
                  onChange={this.handleChange('password')}
                />
              </div>
              <div>
                <LockIcon />
                <TextField 
                  type="password"
                  autoComplete="current-password"
                  id="input-with-icon-grid" 
                  label="Confirm Password" 
                  value={confirmPassword}
                  onChange={this.handleChange('confirmPassword')}
                />
              </div>
              <Button color="default" onClick={this.handleClickLogin} size="small">SUBMIT</Button>
              <BottomLabel color="primary">OWNERS &amp; MAINTENANCE SIGN UP</BottomLabel>
            </CardBody>
            {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
          </Card>
        </HomeContainer>
      </Container>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { user: state.user };
}

export default connect(mapStateToProps)(AdminSignup);

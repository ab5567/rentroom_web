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
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
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
  height: 40rem;
  padding: 4rem 2rem 2rem;
  background: white;
  border-radius: 0rem;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  button {
    margin-left: -375px;
    padding: 0.8rem;
    width: 50%;
    padding: 0.8rem;
    margin-top: 3.5rem;

    @media(max-width: 575.98px) {
      width: 25rem;
      height: 50px;
      margin-left: 0rem;
    }
    @media(max-width: 991.98px) and (min-width: 576px) {
      width:25rem;
      height: 50px;
      margin-bottom: 10rem;
    }
  }

  @media(max-width: 575.98px) {
    width: 30rem;
    height: 30rem;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    width: 60rem;
    height: 40rem;
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
    margin-left: -70px;
    width: 80%;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    width:45%;
    height: 40rem;
    left: -20rem;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 1rem;
  margin-top: 1rem;
  text-align: left;
  position: absolute;
  top: 17rem;
  left: 8rem;
  right: 1rem;

  @media(max-width: 575.98px) {
    margin-top: 1rem;
    text-align: left;
    position: absolute;
    top: 18rem;
    left: 7rem;
    right: 1rem;
  }

  @media(max-width: 991.98px) and (min-width: 576px) {
    margin-top: 1rem;
    text-align: left;
    position: absolute;
    top: 18rem;
    left: 8rem;
    right: 1rem;
}

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
height: 589px;
  font-size: 1rem;
  /* background: #4b74ff;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4);
  border-radius: 3px; */
  position: absolute;
  top: -1rem;
  left: 32rem;
  right: -2rem;

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


export class Home extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
  };

  state = {
    email: '',
    password: '',
    errorMsg: ''
  }

  componentDidMount() {
    const { loginErrorMsg } = this.props.user;
		if (loginErrorMsg) {
			this.setState({ errorMsg: loginErrorMsg });
		}
	}	
	
	componentDidUpdate(prevProps) {
		if (this.props.user.loginErrorMsg !== prevProps.user.loginErrorMsg) {
      const { loginErrorMsg } = this.props.user;
      this.setState({ errorMsg: loginErrorMsg });
		}
	}

  handleClickLogin = () => {
    const { dispatch } = this.props;
    const { email, password } = this.state;
    dispatch(login(email, password));
  };


  handleChange = key => event => {
    const { dispatch } = this.props;
    dispatch(resetLoginFailure());

    this.setState({
      [key]: event.target.value,
    });
  };

  render() {
    const { user } = this.props;
    console.log(user);
    const { email, password, errorMsg } = this.state;

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
                  id="input-with-icon-grid" 
                  label="Email Address" 
                  value={email}
                  onChange={this.handleChange('email')}
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
            </CardBody>
            {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
            <Button color="default" onClick={this.handleClickLogin} size="small">SUBMIT</Button>
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

export default connect(mapStateToProps)(Home);

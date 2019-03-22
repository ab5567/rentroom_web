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


const { spacer } = utils;

const Container = styled.div`
  background: #4A4A4A;
`;

const HomeContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

const Card = styled.div`
  width: 30rem;
  padding: 4rem 2rem 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  button {
    padding: 0.8rem;
    width: 100%;
    padding: 0.8rem;
    margin-top: 1rem;
  }
`;

const CardBody = styled.div`
  width: 100%;

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
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 1rem;
  margin-top: 1rem;
`;

const Header = styled.div`
  padding: 15px;
  background: #4b74ff;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14), 0 7px 10px -5px rgba(233, 30, 99, 0.4);
  border-radius: 3px;
  color: white;
  text-align: center;
  position: absolute;
  top: -2rem;
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
              Login
            </Header>
            <CardBody>
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

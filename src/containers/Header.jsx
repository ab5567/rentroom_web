import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import classNames from 'classnames';
import { Container as StyledContainer } from 'styled-minimal';
import Icon from '@material-ui/core/Icon';
import PrintIcon from '@material-ui/icons/Print';

import rgba from 'polished/lib/color/rgba';
import Button from 'components/Button';


const Wrapper = styled.div`
  height: 80px;
  border-bottom: 1px solid ${props => rgba(props.theme.palette.second, 0.1)};
`;

const Container = styled(StyledContainer)`
  display: flex;
  align-items: center;
  height: 100%;
`; 

const Title = styled.div`
  font-size: 2rem;
  font-weight: 900;
`;

const ButtonsWrapper = styled.div`
  margin-left: auto;

  button:last-child {
    margin-left: 10px;
  }
`;

const DownloadIcon = styled(Icon)`
 &&& {
  font-size: 17px;
  margin-left: 7px;
 }
`;

const StyledIcon = styled(PrintIcon)`
  margin-left: 7px;
  font-size: 10px;
`


class Header extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onPrint: PropTypes.func,
    onExport: PropTypes.func
  };

  render() {
    const { title, onPrint, onExport } = this.props;
    return (
      <Wrapper>
        <Container>
          <Title>{title}</Title>
          <ButtonsWrapper>
            <Button variant="contained" color="secondary" onClick={onPrint}>
              Print
              <StyledIcon />
            </Button>
            <Button variant="contained" color="secondary" onClick={onExport}>
              Export
              <DownloadIcon className={classNames('fa fa-download')} />
            </Button>
          </ButtonsWrapper>
        </Container>
      </Wrapper>
    );
  }
}

export default Header;
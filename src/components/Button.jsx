import styled, { css } from 'styled-components';
import Button from '@material-ui/core/Button';


const AppButton = styled(Button)`
  && {
    color: white;
    font-size: 1rem;
    text-transform: capitalize;

    ${props =>
      (props.color === 'default') &&
      css`
        background-color: ${props.theme.palette.primary};
        &:hover {
          background-color: ${props.theme.palette.primaryDark};
        }
    `};

    svg {
      margin-left: 0.5rem;
    }

  }
`;

export default AppButton;
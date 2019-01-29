import styled from 'styled-components';
import Button from '@material-ui/core/Button';


const AppButton = styled(Button)`
  && {
    background-color: ${props => props.theme.palette.primary};
    font-size: 14px;
    text-transform: capitalize;
    
    &:hover {
      background-color: ${props => props.theme.palette.primaryDark};
    }
  }
`;

export default AppButton;
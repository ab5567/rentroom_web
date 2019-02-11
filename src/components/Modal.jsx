import React, { Fragment } from 'react';
import styled, { css } from 'styled-components';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import rgba from 'polished/lib/color/rgba';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';
import Button from 'components/Button';


const Modal = styled(Dialog)`
  && {
  }
`;

export const ModalTitle = styled(DialogTitle)`
  && {
    border-bottom: 1px solid ${props => rgba(props.theme.palette.second, 0.1)};

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      }
    }
`;

export const ModalContent = styled(DialogContent)`
  && {
    padding: 1rem 4rem 2rem;
  }
`;

const ModalBottomSection = styled(DialogActions)`
  && {
    margin: 0;
    padding: 1.5rem;
    border-top: 1px solid ${props => rgba(props.theme.palette.second, 0.1)};
  }
`;

export const ModalActions = (props) => (
  <ModalBottomSection>
    <Button onClick={props.onSave} color="default">
      Save
      <SaveIcon/>
    </Button>
    <Button onClick={props.onClose} color="default">
      Close
      <CloseIcon/>
    </Button>
  </ModalBottomSection>
);

export default Modal;
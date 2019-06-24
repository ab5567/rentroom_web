import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classNames from 'classnames';
import { Container as StyledContainer } from 'styled-minimal';
import Icon from '@material-ui/core/Icon';
import PrintIcon from '@material-ui/icons/Print';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import rgba from 'polished/lib/color/rgba';
import Button from 'components/Button';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';

const Wrapper = styled.div`
  min-height: 80px;
  border-bottom: 1px solid ${props => rgba(props.theme.palette.second, 0.1)};
  background: white;
`;

const Container = styled(StyledContainer)`
  display: flex;
  align-items: center;
  min-height: 80px;
`;

const Title = styled.div`
  font-size: 2rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  height: 100%;
  min-height: 45px;
`;

const ButtonsWrapper = styled.div`
  margin-left: auto;
  text-align: right;

  button {
    margin: 5px 0 5px 10px;
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
`;

class Header extends React.PureComponent {
  static propTypes = {
    addButtonTitle: PropTypes.string,
    bulkDeleteDisabled: PropTypes.bool,
    editButtonTitle: PropTypes.string,
    onAddAccounts: PropTypes.func,
    onAddNewEntry: PropTypes.func,
    onBulkDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onExport: PropTypes.func,
    onPrint: PropTypes.func,
    onSave: PropTypes.func,
    onScreen: PropTypes.func,
    title: PropTypes.string.isRequired,
  };

  render() {
    const {
      title,
      onPrint,
      onExport,
      onAddNewEntry,
      onAddAccounts,
      onBulkDelete,
      onSave,
      bulkDeleteDisabled,
      onEdit,
      onScreen,
      addButtonTitle,
      editButtonTitle,
      user
    } = this.props;

    const isEditable = user.role === 'Manager'

    return (
      <Wrapper>
        <Container>
          <Grid container justify="space-between">
            <Grid item>
              <Title>{title}</Title>
            </Grid>
            <Grid item sm>
              <ButtonsWrapper>
                {onEdit && isEditable && (
                  <Button variant="contained" color="default" onClick={onEdit}>
                    {editButtonTitle || 'Edit'}
                    <EditIcon />
                  </Button>
                )}
                {onAddNewEntry && isEditable && (
                  <Button variant="contained" color="default" onClick={onAddNewEntry}>
                    {addButtonTitle || 'Add New Entry'}
                    <AddIcon />
                  </Button>
                )}
                {onAddAccounts && isEditable && (
                  <Button variant="contained" color="default" onClick={onAddAccounts}>
                    Add Expenses &amp; Revenues
                    <AddIcon />
                  </Button>
                )}
                {onScreen && isEditable && (
                  <Button variant="contained" color="default" onClick={onScreen}>
                    {addButtonTitle || 'Screen Tenants'}
                    <SearchIcon />
                  </Button>  
                )}
                {onBulkDelete && isEditable && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={onBulkDelete}
                    disabled={bulkDeleteDisabled}
                  >
                    Delete
                    <DeleteIcon />
                  </Button>
                )}
                {/* <Button variant="contained" color="secondary" onClick={onPrint}>
                  Print
                  <PrintIcon />
                </Button> */}
                {onExport && (
                  <Button variant="contained" color="default" onClick={onExport}>
                    Export
                    <DownloadIcon className={classNames('fa fa-download')} />
                  </Button>
                )}
                {onSave && isEditable && (
                  <Button variant="contained" color="default" onClick={onSave}>
                    Save
                    <SaveIcon />
                  </Button>
                )}
              </ButtonsWrapper>
            </Grid>
          </Grid>
        </Container>
      </Wrapper>
    );
  }
}

function mapStateToProps(state) {
  return { 
    user: state.user
  };
}

export default connect(mapStateToProps)(Header);

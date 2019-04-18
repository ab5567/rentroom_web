import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import { Container } from 'styled-minimal';
import update from 'immutability-helper';
import moment from 'moment';
import Header from 'containers/Header';
import { firebaseDatabase } from 'config/firebase';
import { exportCSV } from 'modules/helpers';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from 'components/Button';

import TextField from '@material-ui/core/TextField';
import Progress from 'components/Progress';
import Segment from 'components/Segment';
import Select from 'components/Select';
import PropertySelect from 'components/PropertySelect';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import createReportData from './createReportData'
import ReportTable from './ReportCSVTable'

import { getFirebasePaths } from 'constants/index';

const StyledContainer = styled(Container)`
  text-align: center;
  min-height: calc(100% - 160px);
  // overflow: auto;
`;

const Wrapper = styled(Segment)`
  margin-top: 2rem;
  padding: 2rem;
  height: 100%;
`;

const TextFieldWrapper = styled.div`
  display: flex;
  margin-top: 1rem;
  align-items: center;
  label {
    min-width: 5rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }
`;

const CheckBoxWrapper = styled.div`
  display: flex;
  margin-top: 5px;
  align-items: center;
  label {
    min-width: 5rem;
    text-align: left;
    font-size: 1rem;
    margin-right: 2rem;
  }
`;

const PDFContainer = styled.iframe`
  width: 100%;
  min-height: 700px;
`;

const CheckBox = styled(Checkbox)`
  &&& {
    padding: 0px 6px 0px 12px;
  }
`;

const CheckLabel = styled.div`
  font-size: 1rem;
`;

const GenerateButton = styled(Button)`
  &&& {
    margin-top: 20px;
    min-width: 50%;
  }
`;

const ReportTypes = [
  'Customer Listing', 
  'Open Work Orders', 
  'Rent Roll Analysis', 
  'Profit and Loss (P&L)', 
  // 'Property by Property P&L', 
  // 'All Expenses', 
  // '1099 for Landlords'
];


const ExportTypes = ['PDF', 'CSV'];

export class Reports extends React.PureComponent {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    title: '',
    reportType: ReportTypes[0],
    startDate: moment().format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    properties: [],
    exportType: ExportTypes[0],
    csvData: null,
    pdfUrl: null,
    isAllPropertySelected: false
  }

  handleStateChange = (state) => {
    this.setState(state);
  }

  handleExport = () => {
    const { reportType, exportType, pdfUrl, csvData } = this.state;
    const fileName = `${reportType}(${moment().format('YYYY-MM-DD')})`
    if (exportType === 'CSV') {
      if (csvData && csvData.tableBody.length > 0) {
        const { colDefs, tableBody } = csvData
        exportCSV(colDefs, tableBody, fileName);
      }
    } else {
      if (pdfUrl && csvData.tableBody.length > 0) {
        const { allRawData } = this.props;
        const reportData = createReportData(allRawData, this.state)
        const docDef = reportData.pdfData
        pdfMake.createPdf(docDef).download(fileName);
      }
    }
  }

  handleChange = key => event => {
    let newValue
    if (key === 'properties') {
      newValue = event
    } else if (key === 'isAllPropertySelected') {
      newValue = event.target.checked
    } else {
      newValue = event.target.value
    }
    const updatedValues = {
      [key]: {$set: newValue},
      error: {$set: null},
    }
    
    const suggestions = this.props.allProperties.map(p => ({
      value: p.id,
      label: p.name,
    }))

    if (key === 'properties') {
      updatedValues.isAllPropertySelected = {$set: newValue.length === suggestions.length};
    }
    if (key === 'isAllPropertySelected') {
      updatedValues.properties = {$set: newValue ? suggestions : []}
    }

    if (key !== 'title' && key !== 'exportType')  { 
      updatedValues.csvData = {$set: null};
      updatedValues.pdfUrl = {$set: null};
    }
    const newState = update(this.state, updatedValues);
    this.setState(newState);
  };


  handleGenerateReport = () => {
    const { allRawData } = this.props;
    const reportData = createReportData(allRawData, this.state)

    const docDef = reportData.pdfData
    const pdfDocGenerator = pdfMake.createPdf(docDef);
    pdfDocGenerator.getDataUrl((dataUrl) => {
      this.setState({ 
        pdfUrl: dataUrl,
        csvData: reportData.csvData
      })
    });
  }
    
  render() {
    const { isResidentsLoaded, isPropertiesLoaded, allProperties } = this.props;
    const { title, reportType, startDate, endDate, properties, exportType, pdfUrl, isAllPropertySelected } = this.state;

    let suggestions = []
    if (isPropertiesLoaded) {
      suggestions = allProperties.map(p => ({
        value: p.id,
        label: p.name,
      }))
    }

    return (
      <Fragment>
        <Progress loading={!isResidentsLoaded || !isPropertiesLoaded}/>
        <Header 
          title="Reports"
          onExport={this.handleExport}
        />
        <StyledContainer>
          <Grid container spacing={40}>
            <Grid item xs md={6} lg={7}>
              <Wrapper>
                <h2>Preview</h2>
                {pdfUrl 
                  ? <Fragment>
                      {exportType === 'PDF'
                        ? <PDFContainer src={pdfUrl}/>
                        : <ReportTable
                            formData={this.state}
                          />
                      }
                    </Fragment>
                  : <div>Generate a report by entering information in the form</div>
                }
               </Wrapper>
            </Grid>
            <Grid item xs md={6} lg={5}>
              <Wrapper>
                <h2>Build new report</h2>
                <TextFieldWrapper>
                  <label>Report Title</label>
                  <TextField
                    margin="dense"
                    type="text"
                    value={title}
                    onChange={this.handleChange('title')}
                    fullWidth
                  />
                </TextFieldWrapper>
                <TextFieldWrapper>
                  <label>Report Type</label>
                  <Select
                    options={ReportTypes}
                    value={reportType}
                    onChange={this.handleChange('reportType')}
                    fullWidth
                  />
                </TextFieldWrapper>
                <TextFieldWrapper>
                  <label>Start Date</label>
                  <TextField
                    margin="dense"
                    type="date"
                    value={startDate}
                    onChange={this.handleChange('startDate')}
                    fullWidth
                  />
                </TextFieldWrapper>        
                <TextFieldWrapper>
                  <label>End Date</label>
                  <TextField
                    margin="dense"
                    type="date"
                    value={endDate}
                    onChange={this.handleChange('endDate')}
                    fullWidth
                  />
                </TextFieldWrapper>
                <TextFieldWrapper>
                  <label>Properties</label>
                  <PropertySelect
                    suggestions={suggestions}
                    value={properties}
                    onChange={this.handleChange('properties')}
                  />
                </TextFieldWrapper>
                <CheckBoxWrapper>
                  <label></label>
                  <FormControlLabel
                    control={
                      <CheckBox
                        color="primary"
                        checked={isAllPropertySelected}
                        onChange={this.handleChange('isAllPropertySelected')}
                      />
                    }
                    label={<CheckLabel>All</CheckLabel>}
                  />
                </CheckBoxWrapper>
                <TextFieldWrapper>
                  <label>Export Type</label>
                  <Select
                    options={ExportTypes}
                    value={exportType}
                    onChange={this.handleChange('exportType')}
                    fullWidth
                  />
                </TextFieldWrapper>
                <GenerateButton 
                  variant="contained" 
                  color="default"
                  onClick={this.handleGenerateReport}
                  disabled={properties.length === 0}
                >
                  Generate Report
                </GenerateButton>
              </Wrapper>
            </Grid>
          </Grid>
        </StyledContainer>
      </Fragment>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return { 
    isResidentsLoaded: state.data.isResidentsLoaded,
    isPropertiesLoaded: state.data.isPropertiesLoaded,
    user: state.user,
    allProperties: state.data.properties,
    allRawData: state.data
  };
}

export default connect(mapStateToProps)(Reports);

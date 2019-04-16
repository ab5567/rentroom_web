import moment from 'moment'
import customerListing from './customerListing'
import openWorkOrders from './openWorkOrders'
import profitAndLoss from './profitAndLoss'


const createReportData = (allRawData, formData) => {
    const { title, reportType, startDate, endDate, properties } = formData;

    let reportData;
    switch (reportType) {
      case 'Customer Listing': {
        reportData = customerListing(allRawData, formData)
        break;
      }
      case 'Open Work Orders': {
        reportData = openWorkOrders(allRawData, formData)
        break;
      }  
      case 'Profit and Loss (P&L)': {
        reportData = profitAndLoss(allRawData, formData)
        break;
      }    
    }

    const pdfContent = [
      // {text: title, style: 'header'},
      {text: reportType, style: 'header'},
      {text: properties.map(p => p.label).join(', '), style: 'subHeader'},
      {text: `Current customers as of ${moment().format('dddd, MMMM DD, YYYY')}`, style: 'dateHeader'},
      {
        style: 'mainTable',
        table: reportData.pdfFormat,
        layout: 'headerLineOnly'
      },
    ];

    let pageOrientation = 'portrait';
    if (reportType === 'Profit and Loss (P&L)') {
      pageOrientation = 'landscape'
    }

    const pdfData = {
      content: pdfContent,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
          alignment: 'center'
        },
        subHeader: {
          fontSize: 12,
          margin: [0, 0, 0, 5],
          alignment: 'center'
        },
        dateHeader: {
          fontSize: 11,
          margin: [0, 0, 0, 5],
          italics: true,
          alignment: 'center'
        },
        mainTable: {
          margin: [0, 15, 0, 15]
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black'
        },
        totalRow: {
          color: 'black',
          fontSize: 11,
          italics: true,
        }
      },
      defaultStyle: {
        fontSize: 10
      },
      pageOrientation,
    }

    return {
      pdfData,
      csvData: reportData.csvFormat
    }
}

export default createReportData

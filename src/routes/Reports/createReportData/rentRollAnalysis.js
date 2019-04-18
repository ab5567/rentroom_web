import moment from 'moment'
import times from 'lodash/times'
import uniq from 'lodash/uniq'
import constant from 'lodash/constant'
import { getCurrencyValue, numberWithCommas } from 'modules/helpers';

const getPDFTable = (allRawData, formData) => {

  const { startDate, endDate } = formData;
  let date = moment(startDate).startOf('month');
  let dateString = date.format('YYYY-MM-DD')

  const monthHeaders = [];
  while (dateString < endDate) {
    monthHeaders.push(date.format('MMM YYYY'))
    date = date.add(1, 'months')
    dateString = date.format('YYYY-MM-DD')
  }

  const tableHeader = [
    { text: 'Customer', style: 'tableHeader' },
    { text: 'Address', style: 'tableHeader' }
  ]

  monthHeaders.forEach(mh => {
    tableHeader.push({
      text: mh,
      style: 'tableHeader'
    })
  })

  const propertyNames = formData.properties.map(p => p.value);
  const validProperties = allRawData.properties.filter(p => propertyNames.includes(p.id));
  const emptyCells = times(tableHeader.length - 1, '')
  const tableBody = [];
  const totals = {};

  let fillColor = null;
  validProperties.forEach(property => {
    property.residents.forEach(tenant => {
      if (tenant.uid) {
        const resident = allRawData.residents.find(r => r.id === tenant.uid);
        if (resident) {
          fillColor = fillColor ? null : '#cccccc'
          const row = [
            { text: resident.name, fillColor },
            { text: property.name, fillColor },
          ];
          monthHeaders.forEach(mh => {
            const month = moment(mh, 'MMM YYYY').format("MMMYYYY");
            let amount = 0;
            if (resident.paymentHistory && resident.paymentHistory[month]) {
              amount = getCurrencyValue(resident.paymentHistory[month]);
            }
            totals[mh] = (totals[mh] || 0) + amount
            row.push({ text: `$${numberWithCommas(amount)}`, fillColor })
          })
          tableBody.push(row)
        }
      }
    })
  })

  const totalRow = [{ text: `Total`, style: 'totalRow', colSpan: 2 }, ''];
  monthHeaders.forEach(mh => {
    totalRow.push({
      text: `$${numberWithCommas(totals[mh])}`, 
      style: 'totalRow'
    })
  })
  tableBody.push(totalRow)
  tableBody.push([
    { colSpan: tableHeader.length, text: ' '}, ...emptyCells
  ])

  const body = [tableHeader, ...tableBody];
  const widths = times(tableHeader.length, constant('auto'))

  return (
    {
      headerRows: 1,
      widths,
      body: body
    }
  )
}

const getCSVFormat = (allRawData, formData) => {

  const { startDate, endDate } = formData;
  let date = moment(startDate).startOf('month');
  let dateString = date.format('YYYY-MM-DD')

  const monthHeaders = [];
  while (dateString < endDate) {
    monthHeaders.push(date.format('MMM YYYY'))
    date = date.add(1, 'months')
    dateString = date.format('YYYY-MM-DD')
  }

  const colDefs = [
    { label: 'Customer', id: 'customer' },
    { label: 'Address', id: 'address' }
  ];
  monthHeaders.forEach(mh => {
    colDefs.push({
      label: mh,
      id: mh
    })
  })
  
  const propertyNames = formData.properties.map(p => p.value);
  const validProperties = allRawData.properties.filter(p => propertyNames.includes(p.id));
  const tableBody = [];

  validProperties.forEach(property => {
    property.residents.forEach(tenant => {
      if (tenant.uid) {
        const resident = allRawData.residents.find(r => r.id === tenant.uid);
        if (resident) {
          const row = {
            customer: resident.name,
            address: property.name
          };        
          
          monthHeaders.forEach(mh => {
            const month = moment(mh, 'MMM YYYY').format("MMMYYYY");
            let amount = 0;
            if (resident.paymentHistory && resident.paymentHistory[month]) {
              amount = getCurrencyValue(resident.paymentHistory[month]);
            }
            row[mh] = `$${numberWithCommas(amount)}`;
          })
          tableBody.push(row)
        }
      }
    })
  })

  return (
    {
      colDefs,
      tableBody
    }
  )
}

const customerListing = (allRawData, formData) => {
  console.log('allRawData', allRawData)
  console.log('formData', formData)
  return (
    {
      pdfFormat: getPDFTable(allRawData, formData),
      csvFormat: getCSVFormat(allRawData, formData)
    }
  )
}

export default customerListing

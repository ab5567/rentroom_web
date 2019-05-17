import moment from 'moment'
import times from 'lodash/times'
import uniq from 'lodash/uniq'
import constant from 'lodash/constant'
import { numberWithCommas, getCurrencyValue } from '../../../modules/helpers';
import sumBy from 'lodash/sumBy';


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

  const tableHeader = ['']

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
  const totalIncomes = {};
  const totalExpenses = {};

  tableBody.push([
    { colSpan: tableHeader.length, text: 'Income', style: 'tableHeader' }, ...emptyCells
  ])
  validProperties.forEach(property => {
    let incomes = [];
    if (property.accounts) {
      incomes = property.accounts.filter(a => a.logType === 'Revenue')
    }

    tableBody.push([
      { colSpan: tableHeader.length, text: property.name, style: 'tableHeader' }, ...emptyCells
    ])

    let fillColor = '#cccccc';
    const row = [{ text: 'Rent', fillColor }];
    monthHeaders.forEach(mh => {
      const month = moment(mh, 'MMM YYYY').format("MMMYYYY");
      const monthPayments = property.payments.filter(p => p.month === month);
      const amount = sumBy(monthPayments, function(o) { return getCurrencyValue(o.amount); });      
      totalIncomes[mh] = (totalIncomes[mh] || 0) + amount
      row.push({ text: `$${numberWithCommas(amount)}`, fillColor })
    })
    tableBody.push(row)

    const RevenueTypes = uniq(incomes.map(i => i.type))
    RevenueTypes.forEach(rt => {
      const revenueIncomes = incomes.filter(i => i.type === rt);
      fillColor = fillColor ? null : '#cccccc'
      const row = [{ text: rt, fillColor }];
      monthHeaders.forEach(mh => {
        const monthStart = moment(mh, 'MMM YYYY').startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment(mh, 'MMM YYYY').endOf('month').format('YYYY-MM-DD');
        let amount = 0;
        revenueIncomes.forEach(ri => {
          if (ri.date >= monthStart && ri.date <= monthEnd) {
            amount = ri.amount
          } 
        })
        totalIncomes[mh] = (totalIncomes[mh] || 0) + amount
        row.push({ text: `$${numberWithCommas(amount)}`, fillColor })
      })
      tableBody.push(row)
    })

  })

  const totalIncomeRow = [{ text: `Total Income:`, style: 'totalRow' }];
  monthHeaders.forEach(mh => {
    totalIncomeRow.push({
      text: `$${numberWithCommas(totalIncomes[mh])}`, 
      style: 'totalRow'
    })
  })
  tableBody.push(totalIncomeRow)
  tableBody.push([
    { colSpan: tableHeader.length, text: ' '}, ...emptyCells
  ])

  tableBody.push([
    { colSpan: tableHeader.length, text: 'Expense', style: 'tableHeader' }, ...emptyCells
  ])
  validProperties.forEach(property => {
    let expenses = [];
    if (property.accounts) {
      expenses = property.accounts.filter(a => a.logType === 'Expense')
    }
    if (expenses.length > 0) {
      tableBody.push([
        { colSpan: tableHeader.length, text: property.name, style: 'tableHeader' }, ...emptyCells
      ])

      const ExpenseTypes = uniq(expenses.map(i => i.type))
      let fillColor = null
      ExpenseTypes.forEach(et => {
        const expenseIncomes = expenses.filter(i => i.type === et);
        fillColor = fillColor ? null : '#cccccc'
        const row = [{ text: et, fillColor }];
        monthHeaders.forEach(mh => {
          const monthStart = moment(mh, 'MMM YYYY').startOf('month').format('YYYY-MM-DD');
          const monthEnd = moment(mh, 'MMM YYYY').endOf('month').format('YYYY-MM-DD');
          let amount = 0;
          expenseIncomes.forEach(ei => {
            if (ei.date >= monthStart && ei.date <= monthEnd) {
              amount = ei.amount
            } 
          })
          totalExpenses[mh] = (totalExpenses[mh] || 0) + amount
          row.push({ text: `$${numberWithCommas(amount)}`, fillColor })
        })
        tableBody.push(row)
      })
    }
  })

  const totalExpenseRow = [{ text: `Total Expense:`, style: 'totalRow' }];
  monthHeaders.forEach(mh => {
    totalExpenseRow.push({
      text: `$${numberWithCommas(totalExpenses[mh])}`, 
      style: 'totalRow'
    })
  })
  tableBody.push(totalExpenseRow)
  tableBody.push([
    { colSpan: tableHeader.length, text: ' '}, ...emptyCells
  ])

  const totalNetIncomeRow = [{ text: `Net Income:`, style: 'totalRow' }];
  monthHeaders.forEach(mh => {
    totalNetIncomeRow.push({
      text: `$${numberWithCommas(totalIncomes[mh] - totalExpenses[mh])}`, 
      style: 'totalRow'
    })
  })
  tableBody.push(totalNetIncomeRow)


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
    { label: 'Property', id: 'property' },
    { label: 'Income/Expense', id: 'logType' },
    { label: 'Type', id: 'type' },
  ];
  monthHeaders.forEach(mh => {
    colDefs.push({
      label: mh,
      id: mh
    })
  })

  const propertyNames = formData.properties.map(p => p.value);
  const validProperties = allRawData.properties.filter(p => propertyNames.includes(p.id))
  const tableBody = [];

  validProperties.forEach(property => {

    const row = {
      property: property.name,
      logType: 'Revenue',
      type: 'Rent'
    };    

    monthHeaders.forEach(mh => {
      const month = moment(mh, 'MMM YYYY').format("MMMYYYY");
      const monthPayments = property.payments.filter(p => p.month === month);
      const amount = sumBy(monthPayments, function(o) { return getCurrencyValue(o.amount); });      
      row[mh] = `$${numberWithCommas(amount)}`;
    })
    tableBody.push(row)

    let incomes = [];
    if (property.accounts) {
      incomes = property.accounts.filter(a => a.logType === 'Revenue')
    }
    const RevenueTypes = uniq(incomes.map(i => i.type))
    RevenueTypes.forEach(rt => {
      const revenueIncomes = incomes.filter(i => i.type === rt);
      const row = {
        property: property.name,
        logType: 'Revenue',
        type: rt
      };        
      monthHeaders.forEach(mh => {
        const monthStart = moment(mh, 'MMM YYYY').startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment(mh, 'MMM YYYY').endOf('month').format('YYYY-MM-DD');
        let amount = 0;
        revenueIncomes.forEach(ri => {
          if (ri.date >= monthStart && ri.date <= monthEnd) {
            amount = ri.amount
          } 
        })
        row[mh] = `$${numberWithCommas(amount)}`;
      })
      tableBody.push(row)
    })
  })


  validProperties.forEach(property => {
    let expenses = [];
    if (property.accounts) {
      expenses = property.accounts.filter(a => a.logType === 'Expense')
    }
    if (expenses.length > 0) {
      const ExpenseTypes = uniq(expenses.map(i => i.type))

      ExpenseTypes.forEach(et => {
        const expenseIncomes = expenses.filter(i => i.type === et);
        const row = {
          property: property.name,
          logType: 'Expense',
          type: et
        };
        monthHeaders.forEach(mh => {
          const monthStart = moment(mh, 'MMM YYYY').startOf('month').format('YYYY-MM-DD');
          const monthEnd = moment(mh, 'MMM YYYY').endOf('month').format('YYYY-MM-DD');
          let amount = 0;
          expenseIncomes.forEach(ei => {
            if (ei.date >= monthStart && ei.date <= monthEnd) {
              amount = ei.amount
            } 
          })
          row[mh] = `$${numberWithCommas(amount)}`;
        })
        tableBody.push(row)
      })
    }
  })

  return (
    {
      colDefs,
      tableBody
    }
  )
}

const profitAndLoss = (allRawData, formData) => {
  console.log('allRawData', allRawData)
  console.log('formData', formData)
  return (
    {
      pdfFormat: getPDFTable(allRawData, formData),
      csvFormat: getCSVFormat(allRawData, formData)
    }
  )
}

export default profitAndLoss

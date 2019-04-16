import moment from 'moment'

const getPDFTable = (allRawData, formData) => {

  const tableHeader = [
    {text: 'Ticket Submission Date', style: 'tableHeader'},
    {text: 'Issue Description', style: 'tableHeader'},
    {text: 'Issue Category', style: 'tableHeader'},
    {text: 'Address', style: 'tableHeader'},
    {text: 'Customer Name', style: 'tableHeader'},
    {text: 'Customer Phone Number', style: 'tableHeader'}
  ];

  const validMaintenances = allRawData.maintenances.filter(m => m.status == "Opened");
  const tableBody = [];
  validMaintenances.forEach((m, index) => {
    const fillColor = (index % 2 === 0) ? '#CCCCCC' : null
    
    const uid = m.messages[0].sender;
    let address = ''
    if(uid) {
      address = ((allRawData.addresses[uid] || {}).Address) || ''
    }
    const date = moment.unix(Math.round(parseFloat(m.messages[0].timestamp ))).format('M/D/YYYY, h:mm a'); 
    const issue = [
      { text: date, fillColor },
      { text: `'${m.messages[0].message}'`, fillColor },
      { text: m.subject, fillColor },
      { text: address, fillColor },
      { text: m.tenant, fillColor },
      { text: m.tenant_phone, fillColor }
    ];
    tableBody.push(issue)
  })

  const body = [tableHeader, ...tableBody];
  console.log('Body', tableBody)
  
  return (
    {
      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: body
    }
  )
}

const getCSVFormat = (allRawData, formData) => {
  const colDefs = [
    { label: 'Ticket Submission Date', id: 'date' },
    { label: 'Issue Description', id: 'issueDescription' },
    { label: 'Issue Category', id: 'issueCategory' },
    { label: 'Address', id: 'address' },
    { label: 'Customer Name', id: 'customerName' },
    { label: 'Customer Phone Number', id: 'phoneNumber' }
  ];

  const validMaintenances = allRawData.maintenances.filter(m => m.status == "Opened");

  const tableBody = [];
  validMaintenances.forEach((m) => {
    const uid = m.messages[0].sender;
    let address = ''
    if(uid) {
      address = ((allRawData.addresses[uid] || {}).Address) || ''
    }
    const date = moment.unix(Math.round(parseFloat(m.messages[0].timestamp ))).format('M/D/YYYY, h:mm a'); 
    const customer = {
      date,
      issueDescription: m.messages[0].message, 
      issueCategory: m.subject,
      address,
      customerName: m.tenant,
      phoneNumber: m.tenant_phone,
    };
    tableBody.push(customer)
  })

  return (
    {
      colDefs,
      tableBody
    }
  )
}

const openWorkOrders = (allRawData, formData) => {
  console.log('allRawData', allRawData)
  console.log('formData', formData)
  return (
    {
      pdfFormat: getPDFTable(allRawData, formData),
      csvFormat: getCSVFormat(allRawData, formData)
    }
  )
}

export default openWorkOrders

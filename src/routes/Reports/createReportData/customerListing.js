
const getPDFTable = (allRawData, formData) => {

  const tableHeader = [
    {text: 'Customer Name', style: 'tableHeader'},
    {text: 'Address', style: 'tableHeader'},
    {text: 'Lease Start', style: 'tableHeader'},
    {text: 'Lease End', style: 'tableHeader'}
  ];

  const propertyNames = formData.properties.map(p => p.value);
  const validProperties = allRawData.properties.filter(p => propertyNames.includes(p.id))
  const tableBody = [];
  validProperties.forEach(property => {
    tableBody.push([
      { colSpan: 4, text: property.name, style: 'tableHeader' }, '', '', ''
    ])
    property.residents.forEach((resident, index) => {

      const fillColor = (index % 2 === 0) ? '#CCCCCC' : null
      const customer = [
        { text: resident.name, fillColor },
        { text: resident.address, fillColor },
        { text: resident['lease start'], fillColor },
        { text: resident['lease end'], fillColor }
      ];
      tableBody.push(customer)
    })
    tableBody.push([
      { colSpan: 4, text: `Total Customers: ${property.residents.length}`, style: 'totalRow' }, '', '', ''
    ])
    tableBody.push([
      { colSpan: 4, text: ' '}, ' ', ' ', ' '
    ])
  })

  const body = [tableHeader, ...tableBody];
  console.log('Body', tableBody)
  
  return (
    {
      headerRows: 1,
      widths: ['*', 'auto', 'auto', 'auto'],
      body: body
    }
  )
}

const getCSVFormat = (allRawData, formData) => {
  const colDefs = [
    { label: 'Property', id: 'property' },
    { label: 'Customer Name', id: 'customerName' },
    { label: 'Address', id: 'address' },
    { label: 'Lease Start', id: 'leaseStart' },
    { label: 'Lease End', id: 'leaseEnd' }
  ];

  const propertyNames = formData.properties.map(p => p.value);
  const validProperties = allRawData.properties.filter(p => propertyNames.includes(p.id))
  const tableBody = [];
  validProperties.forEach(property => {
    property.residents.forEach((resident, index) => {
      const customer = {
         property: property.name, 
         customerName: resident.name,
         address: resident.address,
         leaseStart: resident['lease start'],
         leaseEnd: resident['lease end'], 
      };
      tableBody.push(customer)
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

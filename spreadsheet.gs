const wbook = SpreadsheetApp.getActive();
const sheet = wbook.getSheetByName("pelanggan");

function doGet(param) {
if (sheet != null) {
  const perintahWA = param.parameter.perintah;
     let data = [];
     const rlen = sheet.getLastRow();
     const clen = sheet.getLastColumn();
     const rows = sheet.getRange(1, 1, rlen, clen).getValues();

     for (let i=0; i < rows.length; i++) {
          const dataRow = rows[i];
          let record = {};
          for (let j = 0; j < clen; j++) { 
            record[rows[0][j]] = dataRow [j];
      } 
    
    if (i > 0) {
          data.push(record);
      }
  }

  let value = data.find(function(element){
    return element ['IDPEL'] == perintahWA;
  })

  let response = {
    success: value ? true : false,
    data: value ? value : null,
    message: "Melakukan pencarian"
  }

  console.log(response);

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON)
  }
}
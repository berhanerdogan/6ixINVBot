const ck = require('ckey')
const { GoogleAuth } = require('google-auth-library');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = ck.SHEET_ID;

let sheet;

exports.init = async () => {

    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
    )
    console.log("---init google sheet---")
    const client = new GoogleAuth({
        credentials,
        scopes: SCOPES
    })
    let auth = await client.getClient()
    sheet = new google.sheets({version: 'v4', auth})
    console.log("---FINISH init google sheet")
}

exports.get = async (range) => {
    return sheet.spreadsheets.values.get({
        spreadsheetId,
        range
    })
}

exports.update = async (range, values) => {
  return sheet.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values
    }
  });
};


exports.append = (range, values) => {
    return sheet.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {values}
  });
}
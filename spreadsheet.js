const compose = require('async/compose')
const google = require('googleapis')
const GoogleAuth = require('google-auth-library')

const config = require('./config.json')

const sheets = google.sheets('v4')
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
let auth, jwtClient

module.exports.getRange = (params, callback) => {
  compose(getRange, authorize)(params, callback)
}

module.exports.update = (params, callback) => {
  compose(update, authorize)(params, callback)
}

function authorize (params, callback) {
  if (jwtClient && jwtClient.credentials) return callback(null, params)

  auth = new GoogleAuth()
  jwtClient = new auth.JWT(config.clientEmail, null, config.privateKey, SCOPES, null)
  jwtClient.authorize((err, token) => {
    if (err) {
      callback(err)
    } else {
      jwtClient.credentials = token
      callback(null, params)
    }
  })
}

function getRange ({range, majorDimension}, callback) {
  sheets.spreadsheets.values.get({
    auth: jwtClient,
    spreadsheetId: config.spreadsheetId,
    range,
    majorDimension
  }, callback)
}

function update ({cell, value}, callback) {
  sheets.spreadsheets.values.update({
    auth: jwtClient,
    spreadsheetId: config.spreadsheetId,
    range: cell,
    valueInputOption: 'USER_ENTERED',
    resource: {
      range: cell,
      majorDimension: 'ROWS',
      values: [[value]]
    }
  }, callback)
}

const spreadsheet = require('./spreadsheet')
const findLastIndex = require('lodash/findLastIndex')
const find = require('lodash/find')
const includes = require('lodash/includes')
const lowerCase = require('lodash/lowerCase')
const config = require('./config.json')

const COLUMNS = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE'.split(',')
const MONTHS = 'jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec'.split(',')

// cache menu
let menu

module.exports.getMenu = getMenu

module.exports.printMenu = date => {

}

module.exports.getTodayOrder = callback => {
  const now = new Date()
  const day = now.getDay()
  const today = `${now.getDate()} ${MONTHS[now.getMonth()]}`

  if (day === 0 || day === 6) return callback(null, 'It\' weekend, dude.')

  getMenu((err, result) => {
    if (err) return callback(err)

    const key = find(result.result, d => includes(lowerCase(d), today))
    const todayMenu = result.entities[key]
    const dish = todayMenu.find(r => includes(lowerCase(r.orderers), config.codename))
    return callback(null, dish ? `You ordered ${dish.name}` : 'I love KFC!!!')
  })
}

function getMenu (callback) {
  if (menu) return callback(null, menu)

  menu = {
    result: [],
    entities: {}
  }

  spreadsheet.getRange({
    range: 'A1:AD1000',
    majorDimension: 'COLUMNS'
  }, (err, result) => {
    if (err) return callback(err)

    const table = result.values
    const startIndex = limitRange(table)[0]

    table.forEach((column, columnIndex) => {
      if (lowerCase(column[startIndex]) !== 'menu') return

      let no = 0
      let date = table[columnIndex + 2][startIndex]
      menu.result.push(date)
      menu.entities[date] = []

      column.slice(startIndex + 1).forEach((cell, cellIndex) => {
        cell = lowerCase(cell)
        if (cell !== '' && cell !== 'total') {
          menu.entities[date].push({
            name: `(${no++}) ${cell}`,
            cellPosition: `${COLUMNS[columnIndex]}${startIndex + cellIndex + 2}`,
            targetPosition: `${COLUMNS[columnIndex + 2]}${startIndex + cellIndex + 2}`,
            orderers: table[columnIndex + 2][startIndex + cellIndex + 1]
          })
        }
      })
    })

    return callback(null, menu)
  })
}

function limitRange (table) {
  let startIndex = 0
  let endIndex = 0

  table.forEach(column => {
    const index = findLastIndex(column, cell => lowerCase(cell) === 'menu')
    const length = column.length
    startIndex = index >= startIndex ? index : startIndex
    endIndex = length >= endIndex ? length - 1 : endIndex
  })

  return [startIndex, endIndex]
}

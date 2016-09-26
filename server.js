const vorpal = require('vorpal')()
const command = require('./command')
const chalk = vorpal.chalk

const spreadsheet = require('./spreadsheet')
const config = require('./config.json')

vorpal
  .command('todaydish', 'What did I order for today?')
  .action(function (args, callback) {
    command.getTodayOrder((err, result) => {
      if (err) this.log(chalk.red(err.message))
      else this.log(result)
      callback()
    })
  })

vorpal
  .command('order', 'Order from the latest menu.')
  .action(function (args, callback) {
    const self = this

    command.getMenu((err, result) => {
      showMenuSequentially(result.result, result.entities)
    })

    function showMenuSequentially (list, menu) {
      if (!list.length) return callback()
      self.log('========================================')
      self.log(chalk.cyan(list[0]))
      self.log(menu[list[0]].map(r => `${r.name}`).join('\n'))
      self.log('========================================')
      self.prompt({
        type: 'input',
        name: 'dish',
        message: 'Pick number... '
      }, function (result) {
        // console.log(`You picked ${result.dish}`)
        // console.log(`Target cell ${menu[list[0]][result.dish].targetPosition}`)
        // console.log(`Value ${menu[list[0]][result.dish].orderers + `, ${config.codename}`}`)
        const orderers = menu[list[0]][result.dish].orderers

        spreadsheet.update({
          cell: menu[list[0]][result.dish].targetPosition,
          value: orderers ? `${orderers}, ${config.codename}` : config.codename
        }, (err, result) => {
          showMenuSequentially(list.slice(1), menu)
        })
      })
    }
  })

vorpal
  .delimiter(chalk.magenta('lunch-box~$'))
  .show()

const path = require('path')
const chalk = require('chalk')
const Koa = require('koa')
const koaStatic = require('koa-static')
const { portIsOccupied } = require('../util/port')
const { getIpAdress } = require('../util/ip')
const openUrl = require('../util/url')

const app = new Koa()
const PORT = 7000

class Ui {
  setup () {
    this.startUi()
  }
  async startUi () {
    console.log(`🚀 Starting UI...\n`)

    // 静态文件目录
    app.use(koaStatic(path.resolve(__dirname, '../web/public')))

    try {
      const port = await portIsOccupied(PORT)
      app.listen(port, _ => {
        const url = `http://localhost:${port}`
        const addressUrl = `http://${getIpAdress()}:${port}`
        console.log(`Server ready at:\n - Local: ${chalk.green(url)}\n - Network: ${chalk.green(addressUrl)}`)
        openUrl(url)
      })
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = new Ui()
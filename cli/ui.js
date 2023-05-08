const path = require('path')
const chalk = require('chalk')
const Koa = require('koa')
const koaStatic = require('koa-static')
// const { historyApiFallback } = require('koa2-connect-history-api-fallback')
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

    // 除了接口之外的所有请求都发送给静态文件
    // app.use(historyApiFallback({ filters, index }))

    // 静态文件目录
    app.use(koaStatic(path.resolve(__dirname, '../web/dist')))

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
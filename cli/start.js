const path = require('path')
const chalk = require('chalk')
const Koa = require('koa')
const koaStatic = require('koa-static')
const { historyApiFallback } = require('koa2-connect-history-api-fallback')
const { webProxy } = require('../util/proxy')
const { portIsOccupied } = require('../util/port')
const { getIpAdress } = require('../util/ip')
const openUrl = require('../util/url')

const app = new Koa()
const PORT = 8000

class Server {
  constructor () {
    this.whiteList = null
    this.staticPath = null
    this.target = null
    this.index = null
  }
  async setup(options) {
    this.whiteList = JSON.parse(options.whiteList || '["/api"]')
    this.staticPath = options.staticPath || path.resolve(__dirname, '../')
    this.target = options.target || 'http://localhost:18080'
    this.index = options.index || 'index.html'
    this.startServer()
  }
  async startServer () {
    const { target, whiteList, staticPath, index } = this
    console.log(`🚀 Starting SERVER...\n`)

    // 除了接口之外的所有请求都发送给静态文件
    app.use(historyApiFallback({ whiteList, index }))

    console.log(path.resolve(__dirname))
    // 静态文件目录
    app.use(koaStatic(staticPath))

    // 代理
    app.use(async ctx => {
      await webProxy(ctx, { target, changeOrigin: true })
    })

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

module.exports = new Server()
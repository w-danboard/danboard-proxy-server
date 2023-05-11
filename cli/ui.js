const path = require('path')
const chalk = require('chalk')
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const history = require('koa-history-api-fallback')
const koaStatic = require('koa-static')
// const { historyApiFallback } = require('koa2-connect-history-api-fallback')
const { portIsOccupied } = require('../util/port')
const { getIpAdress } = require('../util/ip')
const openUrl = require('../util/url')

const app = new Koa()
const PORT = 3000

const router = require('../src/router')
const registerCtxProps = require('../src/extend/context')

class Ui {
  setup () {
    this.startUi()
  }
  async startUi () {
    console.log(`🚀 Starting UI...\n`)

    // 除了接口之外的所有请求都发送给静态文件
    // app.use(historyApiFallback({ filters, index }))

    app.use(history({
      index: '/index.html',
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
      rewrites: [{
        from: /\/api\/(login\/gitlab|auth\/callback)/,
        to: function (ctx) {
          return ctx.parsedUrl.href
        }
      }, {
        // 屏蔽api、websocket开头的路径，并进行转发
        from: /^(?!\/(api|websocket))/,
        to: function (ctx) {
          if (ctx.parsedUrl.pathname.match(/\.[\w-]+$/)) {
            return ctx.parsedUrl.href
          }
          return '/index.html'
        }
      }]
    }))
    // 静态文件目录
    app.use(koaStatic(path.resolve(__dirname, '../web/dist')))
    
    app.use(bodyParser())
    
    // 挂载全局ctx属性
    registerCtxProps(app)
    app.use(router.routes())

    try {
      const port = await portIsOccupied(PORT)
      app.listen(port, _ => {
        const url = `http://localhost:${port}`
        const addressUrl = `http://${getIpAdress()}:${port}`
        console.log(`Server ready at:\n - Local: ${chalk.green(url)}\n - Network: ${chalk.green(addressUrl)}`)
        // openUrl(url)
      })
    } catch (err) {
      console.log(err)
    }
  }
}

// module.exports = new Ui()
const ui = new Ui()
ui.startUi()
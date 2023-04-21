const httpProxy = require('http-proxy')
const Proxy = httpProxy.createProxyServer()

function webProxy (ctx, option) {
  return new Promise((resolve, reject) => {
    // 监听 res 是否结束
    ctx.res.on('finish', resolve)
    // 发送代理出去，httpProxy 最后代理回来会 emeit ref finish
    Proxy.web(ctx.req, ctx.res, option, reject)
  })
}

module.exports = { webProxy }
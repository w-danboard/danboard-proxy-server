const { jsonStringify } = require('../../utils')
// 获取ws server实例
function getWsServer () {
  return this.app.ws.server
}

// 获取当前ws 创建的客户端
function getWsClients () {
  return this.app.ws.server.clients
}

/**
 * socket 广播
 * @param {*} data 发送的消息
 */
function wsBroadcast (data, type, status = 'success') {
  this.wsClients.forEach((client) => {
    if (client && client.readyState === 1) {
      this[status === 'sucess' ? 'wsSuccess' : 'wsError'](data, type, status, client)
    }
  })
}

/**
 * ws 服务使用,成功发送
 * @param {*}} content 需要发送的内容
 * @param {string} type 发送类型
 */
function wsSuccess (data, type = this.wsMsg.type, status = 'success', client) {
  client = client || this.ws
  if (client && client.readyState === 1) {
    client.send(jsonStringify({
      type,
      data: {
        status,
        content: data
      }
    })) 
  }
}

/**
 * ws 服务使用,失败时发送消息
 * @param {*}} content 需要发送的内容
 * @param {string} type 发送类型
 * @param {striing|number} status 状态
 */
function wsError (data, type = this.wsMsg.type, status = 'error', client) {
  client = client || this.ws
  if (client && client.readyState === 1) {
    client.send(jsonStringify({
      type,
      data: {
        status,
        content: data
      }
    }))
  }
}

module.exports = function (ctx) {
  ctx.__defineGetter__('wsServer', getWsServer)
  ctx.__defineGetter__('wsClients', getWsClients)
  ctx.wsBroadcast = wsBroadcast
  ctx.wsSuccess = wsSuccess
  ctx.wsError = wsError
}
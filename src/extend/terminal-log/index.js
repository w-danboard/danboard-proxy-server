const storeCache = require('../store')
const terminalLogMap = new Map()
// 设置缓存队列
storeCache.set('terminalLogMap', terminalLogMap)

function _getLogTask (id) {
  let logTask = terminalLogMap.get(id)
  if (!logTask) {
    logTask = []
    terminalLogMap.set(id, logTask)
  }
  return logTask
}
/**
 * 添加log日志
 * @param {string} status log类型 success/error
 * @param {string} id taskId
 * @param {*} text 存储数据
 * @param {boolean} isAll 是否获取所有日志
 */
function terminalLog ({ status = 'success', id, text, isAll = false } = {}) {
  let logTaskList = _getLogTask(id)
  // 获取所有
  if (isAll) {
    return logTaskList
  } else {
    const content = {
      text,
      time: Date.now()
    }
    logTaskList.push({
      status,
      content
    })
    if (status === 'success') {
      this.wsBroadcast(content, id, 'success')
    } else {
      this.wsBroadcast(content, id, 'error')
    }
  }
}

module.exports = terminalLog
/**
 * response 成功
 * @param {any} res 返回数据
 */
function success (res) {
  this.body = {
    status: 'success',
    content: res
  }
}

/**
 * response 失败处理
 * @param {any} res 返回数据
 * @param {number} status http 状态
 */
function error (res, status = 200) {
  if (status === 200) {
    // 普通错误抛出
    status && (this.status = status)
    this.body = {
      status: 'error',
      content: res 
    }
  } else {
    // 中断错误抛出
    this.throw(status, {
      status: 'error',
      content: res
    })
  }
}

module.exports = {
  success,
  error
}
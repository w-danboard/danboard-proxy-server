/**
 * 声明log当前项目中支持的类型
 */
const log4js = require('log4js')

const config = require('./config.js')
// 读取log配置项
log4js.configure(config)

/**
 * 获取日志分类名称log对象
 */
function getLogger (name) {
  // name取categories项
  return log4js.getLogger(name || 'default')
}

// 记录访问api记录和左右记录的集合的log
const accessLogger = getLogger('access')
// 记录错误的log
const errorLogger = getLogger('errors')

module.exports = {
  accessLogger,
  errorLogger,
  getLogger
}
 
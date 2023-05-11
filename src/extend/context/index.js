/** ***************** 用于挂载到ctx作用域下，扩展ctx ******************* */
const fs = require('fs')
const path = require('path')
const methods = require('./methods')
const validateObj = require('./validate')
const registWsMethods = require('./ws')
const store = require('../store')
const { accessLogger, errorLogger } = require('../logger')
const terminalLog = require('../terminal-log')
const ChildTask = require('../child-task')

/**
 * 获取所有service服务
 */
function getService () {
  // 获取service下所有服务
  const serviceFolderPath = path.resolve(process.cwd(), './src/service')
  const direntList = fs.readdirSync(serviceFolderPath, { withFileTypes: true })

  const serviceList = {}
  direntList.forEach(dirent => {
    if (dirent.isFile && dirent.name.endsWith('js')) {
      const fileName = dirent.name.replace('.js', '')
      const serviceName = fileName.toLocaleLowerCase()
      serviceList[fileName] = serviceName
    }
  })

  // 获取service服务
  const serviceMap = new Function(`with (this) {return {
    ${Object.entries(serviceList).map(([fileName, name]) => `get ${name} () {
      return require('../../service/${fileName}')
    }`)}
  }}`).call(module)

  return serviceMap
}

/**
 * 枚举一个对象，并挂载到ctx上
 * @param {object} map 需要挂载的对象
 * @param {object} ctx ctx构造函数
 */
function registerObjToCtx (map, ctx) {
  Object.entries(map).forEach(([name, value]) => {
    ctx[name] = value
  })
}

/**
 * 用于为 ctx添加全局属性，用于快速调用属性,用于挂载db service等
 * @param {object} app application app实例
 */
function registerCtxProps (app) {
  // 挂载service
  app.context.service = Object.assign(app.context.service || {}, getService())

  // 挂载本地store
  app.context.store = store
  // 挂载logger
  app.context.logger = accessLogger
  app.context.errorLogger = errorLogger
  // 挂载终端log
  app.context.terminalLog = terminalLog
  app.context.ChildTask = ChildTask

  // 挂载ws方法
  registWsMethods(app.context)
  // 挂载基础方法
  registerObjToCtx(methods, app.context)
  // 挂载validate 验证相关
  registerObjToCtx(validateObj, app.context)
}

module.exports = registerCtxProps

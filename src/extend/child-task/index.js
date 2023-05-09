const storeCache = require('../store')
const { jsonStringify } = require('../../utils')
const { parseArgs } = require('../../utils')
const execa = require('execa')
const treeKill = require('tree-kill')
const chalk = require('chalk')
const taskMap = new Map()
// 设置缓存队列
storeCache.set('taskMap', taskMap)

/**
 * 创建node子任务
 * option = {cwd, id, script}
 */
class childTask {
  constructor (option, ctx) {
    const id = option.id
    const cacheObj = taskMap.get(id)
    if (id && cacheObj &&
      jsonStringify(option) === jsonStringify(cacheObj.option)) {
      // 执行命令
      cacheObj.execScript(option.script)
      return cacheObj
    }
    this.option = option
    this.isNotLog = option.isNotLog
    this.isNotGlobalLog = option.isNotGlobalLog
    this.isNotStatusLog = option.isNotStatusLog
    this.ctx = ctx
    this.taskTag = option.tag || 'Task'
    this.taskCwd = option.cwd || process.cwd()
    this.wsEventType = option.wsStatusEventType || this.ctx.wsMsg.type // 推送状态变化的ws 类型
    // 存储任务id(major key)
    this.taskId = option.id
    this.isRunning = false
    // 存储当前任务
    taskMap.set(this.taskId, this)
    // 存储子进程
    this._childProcess = undefined
    // 执行命令
    this.execScript(option.script)
  }

  execScript (script) {
    let childProcess = this._childProcess
    if (!childProcess && !this.isRunning) {
      // 解析命令参数，处理环境变量的干扰
      const nodeEnv = process.env.NODE_ENV
      delete process.env.NODE_ENV
      const [command, ...args] = parseArgs(script)
      // 任务启动 log
      this._success(`${this.taskTag}: ${this.taskId} started`, 'global-log')
      childProcess = execa(command, args, {
        cwd: this.taskCwd,
        stdio: ['inherit'],
        shell: true,
        env: { FORCE_COLOR: 'true' },
        preferLocal: true,
        localDir: this.taskCwd
      })
      this._childProcess = childProcess
      // 添加启动状态
      this.isRunning = true
      // 状态变化推送
      !this.isNotStatusLog && (this.ctx.wsSuccess({ id: this.taskId, status: this.isRunning }, this.wsEventType))
      if (typeof nodeEnv !== 'undefined') {
        process.env.NODE_ENV = nodeEnv
      }
      childProcess.stdout.on('data', (buffer) => {
        this._success(buffer.toString())
      })
      childProcess.stderr.on('data', (buffer) => {
        this._success(buffer.toString())
      })
  
      childProcess.on('exit', (code, msg) => {
        this._exit(code, msg)
      })
  
      childProcess.on('error', (err) => {
        this._exit(null, err.message)
      })
    }
  }

  // 停止当前任务
  async kill () {
    const pid =  this._childProcess && this._childProcess.pid && this._childProcess.pid.toString()
    if (!pid) return
    return new Promise((resolve, reject) => {
      treeKill(pid, 'SIGKILL', (err) => {
        // 存在错误处理
        if (err) {
          this.ctx.wsError(err.message)
          return reject(err)
        }
        resolve()
      })
    })
  }

  /**
   * 子任务退出处理
   * @param {number} code 退出状态码
   * @param {string} msg 退出状态值
   */
  _exit (code, msg) {
    if (code === 0) {
      // 正常退出
      this._success(`${this.taskTag}: ${this.taskId} finished`, 'global-log')
      this._success(chalk.gray(`${this.taskTag}: ${this.taskId} finished`), this.taskId)
      // 正常退出后回调函数
      this.option.successExit && this.option.successExit(this.option, this.ctx)
    } else if (code === 1){
      // 程序异常退出
      this._error(`${this.taskTag}: ${this.taskId} exit with code ${code}`, 'global-log')
      this._error(chalk.gray(`${this.taskTag}: ${this.taskId} exit with code ${code}`), this.taskId)
      // 错误异常退出后回调函数
      this.option.errorExit && this.option.errorExit(this.option, this.ctx)
    } else if (msg === 'SIGKILL') {
      // (手动退出)
      this._success(chalk.gray(`${this.taskTag}: ${this.taskId} stopped by manual`), this.taskId)
      this._success(`${this.taskTag}: ${this.taskId} stopped by manual`, 'global-log')
    } else {
      this._error(`${this.taskTag}: ${this.taskId} error ${msg}`, 'global-log')
      this._error(chalk.gray(`${this.taskTag}: ${this.taskId} error ${msg}`), this.taskId)
      // 错误异常退出后回调函数
      this.option.errorExit && this.option.errorExit(this.option, this.ctx)
    }

    this._childProcess = undefined
    this.isRunning = false

    // 传递消息
    const res = {
      id: this.taskId,
      status: this.isRunning,
    }
    // 错误时添加错误消息
    code !== 0 && (res.message = msg)
    // 状态变化推送
    !this.isNotStatusLog && (this.ctx[code === 0 ? 'wsSuccess' : 'wsError'](res, this.wsEventType))
  }

  /**
   * 发送成功处理(同时处理log)
   * @param {*} text 错误消息
   * @param {*} id 存储消息id
   */
  _success (text, id = this.taskId) {
    if (this.isNotLog && id !== 'global-log') return
    if (this.isNotGlobalLog && id === 'global-log') return
    const msg = {
      status: 'success',
      id,
      text
    }
    this.ctx.terminalLog(msg)
  }

  /**
   * 发送失败处理(同时处理log)
   * @param {*} text 错误消息
   * @param {*} id 存储消息id
   */
  _error (text, id = this.taskId) {
    if (this.isNotLog && id !== 'global-log') return
    if (this.isNotGlobalLog && id === 'global-log') return
    const msg = {
      status: 'error',
      id,
      text
    }
    this.ctx.terminalLog(msg)
  }

  // 获取历史log
  getHistoryLog () {
    return this.ctx.terminalLog({ id: this.taskId, isAll: true })
  }
}
module.exports = childTask

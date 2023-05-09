// 控制access文件中存储的log level级别 trace/debug/info/warn/error
const loglevel = process.env.logLevel || 'debug'
// 控制控制台中展示错误信息支持形式，支持 trace/debug/info/warn/error
let logStdoutLevel = process.env.logStdoutLevel || 'error'
const levelMap = new Map([
  ['trace', 0],
  ['debug', 1],
  ['info', 2],
  ['warn', 3],
  ['error', 4]
])

// 控制太输出日志基于loglevel的控制，所以不能小于loglevel
if (levelMap.get(logStdoutLevel) < levelMap.get(loglevel)) {
  logStdoutLevel = loglevel
}
module.exports = {
  disableClustering: true,
  appenders: {
    stdout: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%[[%d{yyyy-MM-dd hh:mm:ss}]%] [%c] %m'
      }
    },
    access: {
      type: 'dateFile',
      filename: 'logs/server-access.log',
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%c] %m'
      },
      daysToKeep: 5, // 默认保留五天 @FIXME,log4js该参数支持存在问题，发现access能存两天，需要验证
      keepFileExt: true, // 保留文件扩展名
      pattern: 'yyyy-MM-dd'
    },
    errors: {
      type: 'dateFile',
      filename: 'logs/server-error.log',
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-dd hh:mm:ss}] [%c] %m'
      },
      daysToKeep: 5,
      keepFileExt: true,
      pattern: 'yyyy-MM-dd'
    }
  },
  categories: {
    default: {
      appenders: [
        'stdout'
      ],
      level: logStdoutLevel
    },
    // 全局文件，默认打印access中的日志
    access: {
      appenders: [
        'access',
        ...levelMap.get(loglevel) >= levelMap.get(logStdoutLevel) ? ['stdout'] : []
      ],
      level: loglevel // 设置打入access和控制台中的log数据的类型
    },
    // errors默认会打入到全局access文件，同时也会打入到error文件
    errors: {
      appenders: [
        'errors',
        'access',
        ...levelMap.get('error') >= levelMap.get(logStdoutLevel) ? ['stdout'] : []
      ],
      level: 'error'
    }
  }
}

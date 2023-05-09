const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')

/**
 * 字符串转json
 * @param {*} str 需要处理的字符串
 * @returns 
 */
function jsonParse (str) {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

/**
 * json to string
 * @param {*} data 需要转移的json
 * @returns 
 */
function jsonStringify (data) {
  try {
    return JSON.stringify(data)
  } catch {
    return data
  }
}

/**
 * 返回某个数据的数据类型
 * @param {*} val 需要获取类型的数据
 */
function getTypes (val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLocaleLowerCase()
}

/**
 * 解析ws类型,生成相关的插件名，事件名
 * @param {string} type 要解析的ws type类型
 * @param {string} prefix 需要匹配的前缀进行拆分
 */
function parseWsType (type, prefix = 'plugin') {
  const reg = new RegExp(`^((${prefix})-.*)\\/(.+)$`)
  const match = type.match(reg)
  const res = {}
  if (match) {
    res.name = match[1]
    res.event = match[3]
  }
  return res
}

/**
 * 获取错误信息
 * @param {Error} error 错误实体
 * @param {boolen} isString 返回值是否为string
 * @param {boolean} isStack 是否错误调用栈信息
 */
function getErrorMsg (error, isString = false, isStack = true) {
  let err = error
  if (error && error instanceof Error) {
    // 截取error的错误调用栈的顶部信息
    err = isStack && error.stack ? error.stack.split('\n').splice(0, 2).join('\\n') : error.message
  } else if (isString && error) {
    err = Object.prototype.toString.call(error).slice(8, -1) === 'Object' ? JSON.stringify(error) : error.toString()
  }
  return err
}

/** ********************* 文件处理 *************************** */

// 删文件
function rmFileSync (fileName) {
  return fse.removeSync(fileName)
}

/**
 * 读文件
 * @param {string} fileName 需要读取的文件名
 * @param {boolean} isReturnObject 是否将文件内容作为对象返回，主要用于读取json
 */
function readFileSync (fileName, isReturnObject) {
  let data = fs.readFileSync(fileName, { encoding: 'utf8' })
  if (data && isReturnObject) {
    return jsonParse(data)
  }
  return data
}

/**
 * 写文件
 * @param {string} fileName 文件名
 * @param {*} data 需要写入的数据
 * @param {object|sring} options 写入数据参数
 * @returns 
 */
function writeFileSync (fileName, data, options) {
  return fse.outputFileSync(fileName, data, options)
}

/**
 * 复制文件、文件夹
 * @param {string} sourcePath 源路径
 * @param {string} targetPath 目标路径
 * @param {object} options 参数
 */
function copyFileSync (sourcePath, targetPath, options = {}) {
  return fse.copySync(sourcePath, targetPath, options)
}

/**
 * 判断给出路径是否为文件
 * @param {string} path 文件路径
 * @param {object} options 参数对象
 */
function isFile (path, options) {
  if (!fs.existsSync(path)) return false
  const stat = fs.statSync(path, options)
  if (stat.isFile()) {
    return true
  }
  return false
}

/**
 * 判断是否为文件夹
 * @param {string} path 文件路径
 * @param {object} options 参数对象
 */
function isDir (path, options) {
  if (!fs.existsSync(path)) return false
  const stat = fs.statSync(path, options)
  if (stat.isDirectory()) {
    return true
  }
  return false
}

/**
 * 遍历读取目录内容（子目录，文件名）
 * @param  {string} reqPath 请求资源的绝对路径
 * @param {boolean} opt.noDir 不输出文件夹
 * @param {boolean} opt.noFile 不输出文件
 * @param {boolean} opt.noDot 不输出.开头的文件
 */
function walkSync( reqPath, { noDir = false, noFile = false, noDot = false } = {} ){
  let files = fs.readdirSync( reqPath );
  let dirList = []
  let fileList = []
  let dotFile = []
  files.forEach(item => {
    const stat =  fs.lstatSync(`${reqPath}/${item}`)
    const isDot = item[0] === '.'
    if (!noDot && item[0] === '.') {
      dotFile.push({ type: 'dot', name: item })
    } else if (!noDir && !isDot && stat.isDirectory()) {
      dirList.push({ type: 'dir', name: item })
    } else if (!noFile && !isDot && stat.isFile()) {
      fileList.push({ type: 'file', name: item })
    }
  })

  let result = [
    ...(!noDir ? dirList : []),
    ...(!noFile ? fileList : []),
    ...(!noDot ? dotFile : [])
  ]
  return result
}

/**
 * 创建文件夹
 * @param {string} dir 文件夹路径
 */
function mkdirSync (dir, opt) {
  return fse.ensureDirSync(dir, opt)
}

/**
 * 创建文件（文件存在则不修改）
 * @param {string} filePath 文件路径
 */
function mkFileSync (filePath) {
  return fse.ensureFileSync(filePath)
}
/**
 * merge 函数
*/
function merge (...params) {
  const deepmerge = require('deepmerge')
  // https://github.com/TehShrike/deepmerge
  const emptyTarget = value => Array.isArray(value) ? [] : {}
  const clone = (value, options) => deepmerge(emptyTarget(value), value, options)
  function combineMerge (target, source, options) {
    const destination = target.slice()
    source.forEach(function (e, i) {
      // @fixme 注意，这里针对数组中是以下三种类型的，合并策略为覆盖！！
      // merge([1, 4], [1, 2, 3]) => [1, 2, 3]
      if (['undefined', 'string', 'number'].includes(typeof destination[i])) {
        const cloneRequested = options.clone !== false
        const shouldClone = cloneRequested && options.isMergeableObject && options.isMergeableObject(e)
        destination[i] = shouldClone ? clone(e, options) : e
      } else if (options.isMergeableObject && options.isMergeableObject(e)) {
        destination[i] = deepmerge(target[i], e, options)
      } else if (target.indexOf(e) === -1) {
        destination.push(e)
      }
    })
    return destination
  }
  return deepmerge.all([...params], { arrayMerge: combineMerge })
}

/** **************** request 请求相关 ************************ */
/**
 * 通过http获取外部资源数据
 * @param {string} url 请求路径
 * @param {boolean} isJson 是否返回json数据
 */
function getRemoteHttpData (url, isJson) {
  const http = require('http')
  return new Promise(resolve => {
    http.get(url, res => {
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', chunk => {
        rawData += chunk
      })
      res.on('end', () => {
        rawData += '\n'
        if (isJson) {
          rawData = JSON.parse(rawData)
        }
        resolve(rawData)
      })
    })
  })
}

/**
 * 本地通过浏览器打开某个链接
 * @param {string} url 打开链接
 * @param {object} option 配置项
 */
async function openUrl (url, option) {
  const open = require('open')
  option = option || { app: { name: open.apps.chrome } }
  await open(url, option)
}

/**
 * 编辑器打开
 * https://github.com/yyx990803/launch-editor/tree/master/packages
 * @param {string} filePath 文件或者文件夹路径
 * @param {sring} editorType 编辑器类型
 */
function openInEditor (filePath, editorType = 'code') {
  const launch = require('launch-editor')
  return new Promise((resolve, reject) => {
    launch(filePath, editorType, (_fileName, err) => {
      if (err) {
        reject(err)
      }
    })
    resolve(filePath)
  })
}

/**
 * 获取当前机器的ip
 */
function getIPAdress() {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address
      }
    }
  }
}

/** ********************* 项目相关抽离 ************************* */
/**
 * 判断某个路径是否是一个npm包
 * @param {string} filePath 需要验证的路径
 */
function validateIsNpm (filePath) {
  let packageJsonPath = path.resolve(filePath, './package.json')
  const checkFile = isFile(packageJsonPath)
  if (checkFile) {
    const realPath = fs.realpathSync(packageJsonPath)
    delete require.cache[realPath]
    return require(realPath)
  }
  return false
}

/**
 * 获取npm相关路径
 * @param {string} name npm名称
 * @param {boolean} isMonorepoNpm 是否是monorepo中app
 * @returns 
 */
function getRequireNpmPath (name, isMonorepoNpm = true) {
  let npmPath = false
  let rootPath = process.cwd()
  if (isMonorepoNpm) {
    rootPath = path.resolve(process.cwd(), '../../')
  }
  const tempNpmPath = path.resolve(rootPath, `./node_modules/${name}`)
  if (fs.existsSync(tempNpmPath)) {
    npmPath = fs.realpathSync(tempNpmPath)
  }
  return npmPath
}

/**
 * 解析字符串参数为数组参数，包括去重等处理
 * @param {string} args
 */
exports.parseArgs = function (args) {
  const parts = args.split(/\s+/)
  let result = []
  let arg
  let index = 0
  for (const part of parts) {
    const l = part.length
    if (!arg && part.charAt(0) === '"') {
      arg = part.substr(1)
    } else if (part.charAt(l - 1) === '"' && (
      l === 1 || part.charAt(l - 2) !== '\\'
    )) {
      arg += args.charAt(index - 1) + part.substr(0, l - 1)
      result.push(arg)
      arg = null
    } else if (arg) {
      arg += args.charAt(index - 1) + part
    } else {
      result.push(part)
    }
    index += part.length + 1
  }
  const dedupedArgs = []
  for (let i = result.length - 1; i >= 0; i--) {
    const arg = result[i]
    if (typeof arg === 'string' && arg.indexOf('--') === 0) {
      if (dedupedArgs.indexOf(arg) === -1) {
        dedupedArgs.push(arg)
      } else {
        const value = result[i + 1]
        if (value && value.indexOf('--') !== 0) {
          dedupedArgs.pop()
        }
      }
    } else {
      dedupedArgs.push(arg)
    }
  }
  result = dedupedArgs.reverse()
  return result
}

module.exports = {
  jsonParse,
  jsonStringify,
  getTypes,
  parseWsType,
  getErrorMsg,
  rmFileSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  isFile,
  isDir,
  walkSync,
  mkdirSync,
  mkFileSync,
  merge,
  getRemoteHttpData,
  openUrl,
  openInEditor,
  getIPAdress,
  validateIsNpm,
  getRequireNpmPath
}
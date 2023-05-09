const os = require('os')
const execa = require('execa')
const { walkSync, isDir, openInEditor } = require('../utils')

/**
 * 获取当前机器home路径
 */
function getHomeDir (ctx) {
  const homeDir = os.homedir()
  ctx.success(homeDir)
}

/**
 * 获取某个路径下所有文件
 */
function getFiles (ctx) {
  let { parentPath } = ctx.request.query
  // 默认设置 / 目录
  parentPath = parentPath || '/'
  if (!isDir(parentPath)) {
    return ctx.error('当前路径不是一个文件夹')
  }
  const files = walkSync(parentPath, { noDot: true })
  ctx.success(files)
}

/**
 * 打开某个文件夹
 */
async function openFolder (ctx) {
  ctx.validate({
    path: { type: 'string', required: true, empty: false }
  }, ctx.request.query)
  const { path } = ctx.request.query
  if (!isDir(path)) {
    return ctx.error('当前路径不是一个文件夹')
  }
  await execa('open', [path])
  ctx.success('打开成功')
}

/**
 * 在编辑器打开
 */
async function openEditor (ctx) {
  ctx.validate({
    path: { type: 'string', required: true, empty: false }
  }, ctx.request.query)
  const { path } = ctx.request.query
  if (!isDir(path)) {
    return ctx.error('当前路径不是一个项目文件夹')
  }
  await openInEditor(path)
  ctx.success('打开成功')
}

module.exports = {
  getHomeDir,
  getFiles,
  openFolder,
  openEditor
}
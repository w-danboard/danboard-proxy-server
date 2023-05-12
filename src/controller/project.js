const { validateIsNpm, readFileSync, isFile } = require('../utils')
const fs = require('fs')

/**
 * 启动项目
 */
async function startProject (ctx) {
  ctx.validate({
    path: { type: 'string', required: true, empty: false }
  }, ctx.request.body)
  const { path, proxy, staticFile } = ctx.request.body
  try {
    const server = require('../../cli/start')
    server.setup({ staticPath: path, target: proxy, index: staticFile })
    ctx.success('服务启动成功')
  } catch (err) {
    ctx.error(err)
  }
}

/**
 * 添加项目
 */
async function addProject (ctx) {
  ctx.validate({
    path: { type: 'string', required: true, empty: false }
  }, ctx.request.body)
  const { path } = ctx.request.body
  try {
    // 验证当前路径是否满足一个项目
    // const config = validateIsNpm(path)
    // if (!config) {
    //   return ctx.error('当前路径不是一个项目，请重新选择')
    // }
    const fileStat = fs.statSync(path)
    const isDirectory = fileStat.isDirectory()
    if (!isDirectory) {
      return ctx.error('当前路径错误，请重新选择')
    }
    const name = require('path').basename(path)
    const res = await ctx.service.project.addProject({ path, name })
    ctx.success(res)
  } catch (err) {
    ctx.error(err)
  }
}

/**
 * 获取项目列表
 */
async function getProjectList (ctx) {
  const list = Object.values(await ctx.service.project.getProjectList())
  ctx.success(list)
}

/**
 * 删除项目
 */
async function delProject (ctx) {
  ctx.validate({
    name: { type: 'string', required: true, empty: false }
  }, ctx.request.query)
  await ctx.service.project.delProject(ctx.request.query.name)
  ctx.success('删除成功')
}

/**
 * 设置工作目录
 */
async function setWorkspace (ctx) {
  ctx.validate({
    name: { type: 'string', required: true, empty: false }
  }, ctx.request.body)
  // 获取工作目录信息
  const res = await ctx.service.project.getProject(ctx.request.body.name)
  if (res) {
    // 设置工作目录
    ctx.session.workspace = res
    ctx.wsSuccess(res, 'global-workspace-change')
    ctx.success(res)
  } else {
    ctx.error('该项目已不存在')
  }
}

/**
 * 获取当前工作目录（根据session获取）
 */
async function getWorkspace (ctx) {
  // const workspaceInfo = ctx.session.workspace || ''
  // 获取工作目录信息
  // if (workspaceInfo.name) {
    const res = await ctx.service.project.getProject(workspaceInfo.name)
    ctx.success(res)
  // }
}

/**
 * 获取readme文件内容
 */
async function getReadme (ctx) {
  const workspaceInfo = ctx.session.workspace || ''
  // 获取工作目录信息
  if (workspaceInfo.name) {
    const filePath = path.resolve(workspaceInfo.path, './readme.md')
    if (isFile(filePath)) {
      const res = readFileSync(filePath)
      return ctx.success(res)
    }
  }
  ctx.error('该项目不存在说明文件')
}

module.exports = {
  startProject,
  addProject,
  getProjectList,
  delProject,
  setWorkspace,
  getWorkspace,
  getReadme
}
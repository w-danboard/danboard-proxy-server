/**
 * 获取已经注册的全部插件，包括注册的路由
 * @param {object} ctx 全局作用域
 */
 async function getPluginRouter (ctx) {
  const plugins = await ctx.service.plugin.getAllCanUsedPlugins()
  const router = await ctx.service.router.getMenuList()
  ctx.success({
    plugins,
    router
  })
}

/**
 * 更新某个插件的私有化配置
 */
async function updateConfig (ctx) {
  // 判断是本地插件、还是npm插件
  ctx.validate({
    name: { type: 'string', required: true },
    data: { type: 'object', required: true }
  }, ctx.request.body)
  const { name, data } = ctx.request.body
  // 判断是本地插件、还是npm插件
  const pluginPath = ctx.service.setting.getPluginPath(name)
  if (!pluginPath) return ctx.error('当前插件不存在！')
  await ctx.service.setting.setConfig(`${pluginPath}.customConfig`, data)
  ctx.success()
}

/**
 * 获取某个插件的私有化配置
 */
async function getConfig (ctx) {
  // 判断是本地插件、还是npm插件
  ctx.validate({
    name: { type: 'string', required: true, empty: false },
    path: { type: 'string', required: false }
  }, ctx.request.query)
  const { name, path } = ctx.request.query
  const pluginPath = ctx.service.setting.getPluginPath(`${name}`)
  if (!pluginPath) return ctx.error('当前插件不存在！')
  const data = ctx.service.setting.getConfig(`${pluginPath}.customConfig${path ? `.${path}` : ''}`)
  ctx.success(data)
}

module.exports = {
  getPluginRouter,
  updateConfig,
  getConfig
}

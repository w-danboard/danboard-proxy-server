/**
 * 设置全局配置
 */
async function updateConfig (ctx) {
  const data = ctx.request.body
  await ctx.service.setting.setConfig('setting', data)
  ctx.success('设置成功')
}

/**
 * 获取全局配置(部分分支)
 */
function getConfig (ctx) {
  const { name } = ctx.request.query // query 参数存在，查询部分数据
  const res = ctx.service.setting.getConfig(name)
  ctx.success(res)
}

module.exports = {
  updateConfig,
  getConfig
}
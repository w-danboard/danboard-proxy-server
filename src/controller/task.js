const { validateIsNpm } = require('../utils')

// 获取项目所有script任务
function getTask (ctx) {
  const wordSpace = ctx.session.workspace
  const projectPath = wordSpace.path
  const config = validateIsNpm(projectPath)
  if (config) {
    const scriptList = config.scripts
    ctx.success(scriptList)
  } else {
    ctx.error('当前项目不存在任务')
  }
}

module.exports = {
  getTask
}
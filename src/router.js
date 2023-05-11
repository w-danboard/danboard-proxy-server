const Router = require('@koa/router')
const hasWorkSpace = require('./middleware/has-workspace')
const controller = require('./controller')
const passport = require('koa-passport')
const router = new Router()

// 挂载路由前缀
router.prefix('/api')

/** ******************** 项目管理相关 ******************** */
// 获取用户工作目录
router.get('/finder/homedir', controller.finder.getHomeDir)
// 查找某个路径下所有子文件
router.get('/finder/files', controller.finder.getFiles)
// 打开文件或文件夹
router.get('/finder/open', controller.finder.openFolder)
// 打开编辑器(默认vscode)
router.get('/finder/open-editor', controller.finder.openEditor)

// 导入项目
router.post('/project/add', controller.project.addProject)
// 项目列表
router.get('/project/list', controller.project.getProjectList)
// 删除项目
router.delete('/project', controller.project.delProject)
// 设置工作目录
router.post('/project/workspace', controller.project.setWorkspace)
// 获取工作目录
// router.get('/project/workspace', hasWorkSpace, controller.project.getWorkspace)
router.get('/project/workspace', controller.project.getWorkspace)
router.get('/project/get-readme', hasWorkSpace, controller.project.getReadme)
// 获取项目所有任务
router.get('/project/task', hasWorkSpace, controller.task.getTask)

// 支持插件设置自己私有配置，存入本地插件私有配置中
router.post('/plugin/config', controller.plugin.updateConfig)

router.get('/plugin/config', controller.plugin.getConfig)

/** ******************* 配置管理 ***************************** */
router.post('/setting', controller.setting.updateConfig) // 设置全局配置
router.get('/setting', controller.setting.getConfig) // 获取全局配置

/** ******************* gitlab oauth ***************************** */
router.get('/login/gitlab', async (ctx, next) => {
  // 记录上次跳转前路径
  ctx.session.lastRefer = ctx.query.return_url
  await next()
}, passport.authenticate('gitlab', { scope: 'api' }))

router.get('/auth/callback', passport.authenticate('gitlab'), function (ctx) {
  // 授权成功
  if (ctx.isAuthenticated()) {
    // 跳转到上次进入路由页面
    ctx.response.redirect(ctx.session.lastRefer || '/')
    ctx.session.lastRefer = ''
  } else {
    // 重新授权
    ctx.response.redirect(`${ctx.config.apiPrefix}/login/gitlab`)
  }
})

// 获取授权用户的token
router.get('/gitlab-token', controller.user.getUserToken)

router.get('/get-plugin-router', controller.plugin.getPluginRouter)

module.exports = router
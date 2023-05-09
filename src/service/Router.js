const path = require('path')
const { rmFileSync, copyFileSync, readFileSync, getRequireNpmPath, isFile, isDir } = require('../utils')
// 获取所有插件菜单
function getMenuList () {
  const res = db.get('router').value()
  return res
}

// 设置菜单
async function setMenu ({ name, type = 'add', aliasName = name, pluginPath, isLocal } = {}) {
  let res
  const pluginConfig = config.pluginConfig
  const isPlugin = isLocal ?
    checkIsLocalPlugin(pluginPath, pluginConfig.configFile) :
    checkIsPlugin(aliasName, pluginConfig.configFile)
  const distNpmWebPath = path.resolve(pluginConfig.pluginStaticPath,  `./${name}`)
  if (isPlugin && type === 'add' || type === 'upgrade') {
    const npmPath = getRequireNpmPath(`${aliasName}`, process.env.NODE_ENV === 'development')
    const npmWebPath = path.resolve(npmPath, `./${pluginConfig.webPath}`)
    // 获取当前插件的配置文件
    const { project, isGitlabAuth } = require(`${aliasName}/${pluginConfig.configFile}`)
    if (npmWebPath && isDir(npmWebPath)) {
      // copy npm web 文件到静态资源文件夹下
      copyFileSync(npmWebPath, distNpmWebPath)
      // 读取插件路由，并对路由进行处理
      const routerPath = path.resolve(`${npmPath}/${pluginConfig.uiRouterFile}`)
      const routerList = isFile(routerPath) ? readFileSync(routerPath, true) : []
      routerList.forEach(item => {
        item.name = `${project ? pluginConfig.projectRouterPrefix : pluginConfig.commonRouterPrefix}/${name}/${item.name}`
        item.path = `/${item.name}`
        item.meta = Object.assign(item.meta || {}, {
          app: name,
          isGitlabAuth
        })
      })
      res = await db.set(`router.${name}`, routerList).write()
    } else {
      throw 'web资源不存在，请重新打包'
    }
  } else if (isPlugin) {
    // 删除web文件
    rmFileSync(distNpmWebPath)
    res = await db.unset(`router.${name}`).write()
  }
  return res
}

module.exports = {
  getMenuList,
  setMenu
}
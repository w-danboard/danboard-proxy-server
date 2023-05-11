// 获取所有插件菜单
function getProjectList () {
  const res = db.get('projects').value()
  return res
}

// 设置菜单
async function addProject ({ path, name, description } = {}) {
  // 兼容name包含.时被lowdb识别为切割字符
  name = name.replace(/\./g, '-')
  // if (getProject(name)) {
  //   throw '该项目已经存在'
  // }
  // await db.get('projects')
  //   .set(name,
  //   {
  //     name,
  //     description,
  //     path, // 项目路径
  //     customTask: []
  //   })
  //   .write()
  // return getProject(name)
  return { path, name, description }
}

/**
 * 获取单个project信息
 * @param {string} name 项目名称
 */
function getProject (name) {
  return db.get(`projects.${name}`).value()
}

/**
 * 删除某个项目
 * @param {string} name 项目名称
 */
async function delProject (name) {
  const rs = await db.get('projects')
    .unset(name)
    .write()
  return rs
}

/**
 * 获取项目下所有自定义任务列表
 * @param {string} name 项目名称
 */
async function getAllProjectCustomTask (name) {
  let data = db.get(`projects.${name}.customTask`).value()
  if (!data) {
    await db.get(`projects.${name}`)
      .set('customTask', [])
      .write()
    data = db.get(`projects.${name}.customTask`).value()
  }
  return data
}

/**
 * 新增项目自定义任务
 * @param {string} name 项目名称
 */
async function setProjectCustomTask (name, data) {
  await db.get(`projects.${name}.customTask`)
    .push(data)
    .write()
}

/**
 * 删除某个项目
 * @param {string} name 项目名称
 */
 async function delProjectCustomTask (name, data) {
  const res = db.get(`projects.${name}.customTask`)
  const index = res.findIndex(item => item.scriptAlias === data.scriptAlias)
  await db.get(`projects.${name}.customTask`).splice(index, 1).write()
}

module.exports = {
  addProject,
  getProjectList,
  getProject,
  delProject,
  getAllProjectCustomTask,
  setProjectCustomTask,
  delProjectCustomTask
}
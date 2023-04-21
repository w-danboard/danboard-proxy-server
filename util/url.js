// 本地通过浏览器打开某个链接
async function openUrl (url, option) {
  const open = require('open')
  option = option || { app: { name: open.apps.chrome } }
  await open(url, option)
}

module.exports = openUrl
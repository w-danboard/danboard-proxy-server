module.exports = async function (ctx, next) {
  // 判断是否有工作空间
  if (!ctx.session || !ctx.session.workspace) {
    const msg = '当前工作目录不存在，请重新设置！'
    if (ctx.ws) {
      return ctx.wsError(msg, ctx.wsMsg.type, 203)
    } else {
      return ctx.error(msg, 203)
    }
  }
  await next()
}
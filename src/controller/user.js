function getUserToken (ctx) {
  if (ctx.isAuthenticated() && ctx.state.user) {
    ctx.success(ctx.state.user)
  } else {
    // 未授权用户，需要授权用户登陆
    ctx.error('未授权用户，需要授权用户才能完整访问gitlab资源信息')
  }
}
module.exports = {
  getUserToken
}
import axios from 'axios'
import { Message } from 'element-ui'
import store from '../store'

/**
 * 兼容vue实例访问 && 非vue实例访问
 */

// cancel集合，避免互相冲突 <method:url>做主键，适配Restful方式
const CancelToken = axios.CancelToken
let cancelCollection = new Map()

/**
 * 发送请求前拦截
 */
axios.interceptors.request.use(req => {
  return req
}, error => {
  return Promise.reject(error)
})

/**
 * 成功响应后拦截
 */
axios.interceptors.response.use(res => {
  return res
}, error => {
  return Promise.reject(error)
})

export default {
  install (Vue) {
    Vue.prototype.$request = request
    Vue.prototype.$requestCancel = requestCancel
  }
}

/**
 * 发送请求
 * @param reqData 请求配置项
 * @param reqOptions 请求可选项
 * @returns {Promise}
 */
export const request = function (reqConfig, reqOptions = {}) {
  let from = (this || {}).$route
  // 默认get请求、请求超时60s、不需要取消请求、tag
  let { method = 'get', url = '', timeout = 60000, data, baseURL = '/api' } = reqConfig
  let {
    isCancel = false,       // 取消请求
    tag = '',               // tag标识、loading使用
    responseType = 'json',  // 请求类别
    isPromptError = true   // 错误提示
  } = reqOptions
  // 兼容两种经写法
  tag = tag || reqConfig.tag
  // 请求前增加loading 依赖elementUI
  if (tag && this.loading) {
    this.$set(this.loading, tag, true)
  }

  return new Promise((resolve, reject) => {
    let axiosOptions = {
      method,
      url,
      data,
      timeout,
      baseURL,
      // 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'。default json
      responseType
    }
    // 需要取消，按规则<method:url>暂存
    if (isCancel) {
      axiosOptions.cancelToken = new CancelToken(function (c) {
        cancelCollection.set(`${method.toUpperCase()}:${url.toLowerCase()}`, c)
      })
    }

    // 发送请求
    axios(axiosOptions).then(res => {
      let { status, content, errorCode, message } = res.data
      // 请求后移除loading
      if (tag && this.loading) {
        this.$set(this.loading, tag, false)
      }
      // 如果返回的不是 json，直接将 response 返回
      if (responseType !== 'json') {
        return resolve(res)
      }
      if (status === 'success') {
        // 成功返回content内容
        resolve(content)
      } else {
        // 100007 token失效
        // @FIXME：token失效错误码反生变更，兼容处理
        if (['100007', '100026'].includes(errorCode)) {
          // 触发重新登录
          return store.commit('base/isReLogin', true)
        }
        /* eslint-disable prefer-promise-reject-errors */
        isPromptError && Message.error({
          message: Array.isArray(content) && content.length ? content[0].message : message
        })
        reject({
          errorCode: errorCode,
          // Object.keys 如果传递的是一个数组，会将下标做为key去操作。
          message: Object.keys(content || {}).length > 0 ? content : message
        })
      }
    }, err => {
      let errorMsg = '请求发生了错误'
      // 请求后移除loading
      if (tag && this.loading) {
        this.$set(this.loading, tag, false)
      }
      if (err.code === 'ECONNABORTED') {
        errorMsg = '请求超时！'
      } else if (axios.isCancel(err)) {
        errorMsg = '请求被取消！'
      } else {
        console.log(err)
      }
      reject({
        errorCode: err.response && err.response.status,
        message: `${errorMsg}：${err}`
      })
    })
  })
}

/**
 * 取消请求
 */
export const requestCancel = function (reqConfig) {
  let { method = 'get', url = '' } = reqConfig
  let key = `${method.toUpperCase()}:${url.toLowerCase()}`
  // 按规则获取对应的cancel函数 ，然后执行取消操作
  typeof cancelCollection.get(key) === 'function' && cancelCollection.get(key)()
  cancelCollection.delete(key)
}

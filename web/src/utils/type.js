/**
 * 判断类型
 */
export default function _isType (type) {
  return function (obj) {
    return Object.prototype.toString.call(obj) === '[object ' + type + ']'
  }
}

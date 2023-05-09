import isDom from './is-dom'
import isString from './is-string'
/**
 * 获取当前元素的样式
 * @param {object<node>} dom dom元素
 * @param {string} attrName dom样式名
 */
const letterReg = /-(\w)/g
export default function getDomStyle (dom, attrName = '') {
  // 判断dom是否为dom节点元素
  if (!isDom(dom)) return
  if (!isString(attrName)) return
  // 将属性转成小驼峰
  attrName = attrName.replace(letterReg, (all, letter) => letter.toUpperCase())
  let res
  // 主流浏览器
  if (getComputedStyle) {
    res = getComputedStyle(dom, null)
    // 存在属性名，返回属性值
    if (attrName) {
      res = res[attrName]
    }
    return res
  } else if (dom.currentStyle) {
    res = dom.currentStyle
    // 旧版本浏览器
    if (attrName === 'float') {
      res = res.getAttribute('styleFloat')
      return res
    } else if ((attrName === 'width' || attrName === 'height') && (res[attrName] === 'auto')) {
      // 取高宽使用 getBoundingClientRect
      res = dom.getBoundingClientRect()
      return res[attrName] + 'px'
    }
    // 存在属性名，返回属性值，否则返回全部结果
    res = attrName ? res.getAttribute(attrName) : res
    return res
  }
}

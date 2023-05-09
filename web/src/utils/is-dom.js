/**
 * 是否为dom节点
 * @param {object<node>} el 检查的元素
 */
export default function isDom (el) {
  let isNode = false
  if (typeof el === 'object' &&
    el.nodeType === 1 &&
    typeof el.nodeName === 'string') {
    isNode = true
  }
  return isNode
}

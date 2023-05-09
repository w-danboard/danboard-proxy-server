/**
 * 解绑事件
 * @param {objct<dom>} element 需要绑定事件的元素
 * @param {string} event 添加事件的事件类型
 * @param {function} handler 事件函数
 */
export default function offEvent (element, event, handler) {
    // 暂无绑定事件时，不需要清除事件
    if (!element || !event || !element.eventList || !element.eventList[event]) return
    // 初始化需要解绑的事件队列
    let events = []
    // 传递事件函数时，在元素的事件队列中清除该事件函数
    if (handler) {
      const index = element.eventList[event].indexOf(handler)
      if (index > -1) {
        events = element.eventList[event].splice(index, 1)
      }
    } else {
      // 无函数传递时，清除所有事件队列
      events = element.eventList[event].splice(0)
    }
    // 遍历队列 解绑事件
    events.forEach(fn => {
      if (document.addEventListener) {
        element.removeEventListener(event, fn, false)
      } else {
        element.detachEvent('on' + event, fn)
      }
    })
    // 清空队列
    events = undefined
  }
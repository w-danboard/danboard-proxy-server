/**
 * 添加js 事件
 * @param {objct<dom>} element 需要绑定事件的元素
 * @param {string} event 添加事件的事件类型
 * @param {function} handler 事件函数
 */
export default function onEvent (element, event, handler) {
    if (!element || !event || !handler) return
    // 绑定事件对象
    if (!element.eventList) {
      element.eventList = {}
    }
    // 添加事件队列
    if (!element.eventList[event]) {
      element.eventList[event] = []
    }
    // 将当前绑定的事件添加到事件队列
    element.eventList[event].push(handler)
    if (document.addEventListener) {
      element.addEventListener(event, handler, false)
    } else {
      element.attachEvent('on' + event, handler)
    }
  }
import { getStyle } from 'element-ui/lib/utils/dom'
import Popper from 'element-ui/lib/utils/popper'
import Vue from 'vue'
import { isObject, offEvent, onEvent } from '../utils'
// 改写popper的update机制，避免整体报错
const oldUpdate = Popper.prototype.update
Popper.prototype.update = function (...param) {
  if (!this._reference) return
  oldUpdate.call(this, ...param)
}

// 设置默认tooltip配置
const defaultOpt = {
  effect: 'dark',
  placement: 'top',
  disabled: false,
  offset: 0,
  transition: 'el-fade-in-linear',
  visibleArrow: true,
  popperOptions: { boundariesElement: 'body', gpuAcceleration: false },
  openDelay: 0,
  enterable: true,
  hideAfter: 0,
  tabindex: 0,
  // 超过显示宽度时是否支持tooltip显示，false => 显示提示框 true => 超出显示提示框（需要获取元素宽度，故不支持行内样式）
  idssOverWidthDisplay: false,
  // 是否使用html文本格式传递content
  dangerouslyUseHTMLString: false,
  // 父级配置tooltip的prop的对象名称
  idssTooltipOptName: 'tooltipOpt'
}
/**
 * 声明一个vm实例，用于接收html数据
 */
const htmlVm = new Vue({
  data () {
    return { html: '' }
  },
  render (createElement) {
    return createElement(
      'div',
      { domProps: { innerHTML: this.html } }
    )
  }
}).$mount()

/**
 * 将popper的引用元素设置为当前触发元素
 * @param {dom} el
 * @param {object} popper popper对象
 * @param {object} opt 配置参数
 * @package {object} isFocus 是否获取焦点
 */
function setReference (el, popper, opt, isFocus = false) {
  return async function () {
    // popper disable时，不展示
    if (popper.disabled) {
      popper.popperJS && (popper.popperJS._reference = null)
      popper.referenceElm = popper.$refs.reference = null
      return
    }
    // 设置引用元素
    popper.referenceElm = popper.$refs.reference = el
    popper.currentEl = el
    // 是否显示tooltip，重新处理opt
    opt = checkShowTooltip(opt, el)
    // 如果不显示，不弹出提示框
    if (opt.disabled) return
    // 通过父级设置对象tooltip props
    popper.$parent[defaultOpt.idssTooltipOptName] && (popper.$parent[defaultOpt.idssTooltipOptName] = opt)
    // 兼容poppervm的currentPlacement配置，优先级比较高
    opt.placement && (popper.currentPlacement = opt.placement)
    popper.$slots.content = undefined
    // 支持html文本
    if (opt.dangerouslyUseHTMLString) {
      htmlVm.$set(htmlVm, 'html', opt.content)
      await htmlVm.$nextTick()
      popper.$slots.content = htmlVm._vnode
    }
    popper.$nextTick(() => {
      popper.popperJS = null
      // @HACK 用于触发v-popper的watch的showPopper事件
      popper.showPopper = 1
      // 需要设置获取焦点
      isFocus && (popper.focusing = true)
      popper.show()
    })
  }
}
/**
 * 获取tooltipVm实例
 * @param {vnode} vnode 虚拟节点
 * @param {string|vm} refName tooltip实例名称，获取实例顺序优先级：默认获取全局 => 当前父级获取
 * @param {boolean|string} isRootReplace 如果root对象存在，是否使用root对象替换，默认为false
 */
async function getTooltipVm (vnode, refName, { isRootReplace = false }) {
  let popper
  let $root
  // 是否存在全局配置项
  let isHasConFig = Vue.prototype.$COMPONENTS_CONFIG && Vue.prototype.$COMPONENTS_CONFIG['vTooltip']
  // 优先获取全局配置项，否则使用默认refName
  let defaultName = (isHasConFig && isHasConFig['refName']) || 'tooltip'
  refName = refName || defaultName
  // 判断是ref引用名称
  if (typeof refName === 'string' || isRootReplace) {
    let newRefName = refName
    if (isRootReplace) newRefName = defaultName
    // el 为配置实例所在dom元素选择器，如果存在全局配置项直接使用，否则使用默认的 #app
    let domSelector = document.querySelector((isHasConFig && isHasConFig['el']) || '#app')
    // 获取popper对象 (@fix 静态tooltip提示时不展示，原因组件初始是 vm实例没有初始化完成)
    if (domSelector) {
      $root = domSelector.__vue__
      await $root.$nextTick()
      $root = domSelector.__vue__
    }

    // 默认获取root
    popper = $root && $root.$refs[newRefName]
    // 根实例或者父级查找到
    if (popper) {
      // 数组情况兼容处理
      Array.isArray(popper) && (popper = popper[0])
    }
  }
  // 接收vm实例且root上tooltip不存在时，使用传递vm实例
  if (typeof refName !== 'string' && !popper) {
    popper = refName
  }

  return popper
}
/**
 * 计算文本域文本长度
 * @param {dom} inputDom 输入文本dom
 */
function caclTextWidth (inputDom) {
  // 文本域不能直接获取宽度，通过创建临时dom来获取
  const width = inputDom.offsetWidth -
    parseInt(getStyle(inputDom, 'paddingLeft'), 10) -
    parseInt(getStyle(inputDom, 'paddingRight'), 10)
  // 创建临时dom处理宽度
  const el = document.createElement('div')
  el.innerText = inputDom.value
  el.style = `width:${width}px; white-space: nowrap; overflow:hidden;`
  document.body.appendChild(el)
  const res = calcWidth(el)
  document.body.removeChild(el)
  return res
}
/**
 * 计算dom元素的宽度相关值
 * @param {dom} el 需要计算的dom元素
 */
function calcWidth (el) {
  // 计算文本宽度和容器宽度大小
  const range = document.createRange()
  range.setStart(el, 0)
  range.setEnd(el, el.childNodes.length)
  const rangeWidth = range.getBoundingClientRect().width
  const padding = (parseFloat(getStyle(el, 'paddingLeft'), 10) || 0) +
    (parseFloat(getStyle(el, 'paddingRight'), 10) || 0)
  return {
    rangeWidth,
    padding,
    offsetWidth: el.offsetWidth,
    scrollWidth: el.scrollWidth
  }
}
/**
 * 是否显示tooltip
 * rangeWidth 文字所占宽度
 * offsetWidth 容器宽度
 * @param {object} opt 配置参数
 * @param {dom} el 需要控制是否显示提示框的元素
 */
function checkShowTooltip (opt, el) {
  // 判断是否输入文本域
  let inputDom
  // 计算宽度结果
  let caclRes
  // 处理content不存在，提取内部文本
  if (opt.autoContent) {
    opt.content = el.innerText || el.textContent
    // 文本框的处理
    inputDom = el.querySelector('texatrea,input')
    if (inputDom) {
      opt.content = inputDom.value
    }
  }
  // 判断slot实际宽度大于显示宽度 tooltip显示
  if (!opt.originDisabled && opt.idssOverWidthDisplay) {
    // 获得计算结果
    if (inputDom) {
      caclRes = caclTextWidth(inputDom)
    } else {
      caclRes = calcWidth(el)
    }
    // 判断当前targe的展示宽度和实际宽度对比，实际宽度大则展示
    if ((Math.round(caclRes.rangeWidth + caclRes.padding) > caclRes.offsetWidth) || (caclRes.scrollWidth > caclRes.offsetWidth)) {
      opt.disabled = false
    } else {
      opt.disabled = true
    }
  }
  return opt
}
/**
 * 初始化事件
 */
async function initEvent (el, binding, vnode, unbindEventFn) {
  const opt = binding.value && isObject(binding.value)
    ? Object.assign({}, defaultOpt, binding.value)
    : Object.assign({}, defaultOpt)
  // 自动获取content
  if (!opt.content) {
    opt.autoContent = true
  }
  // 记录上次传入的绑定
  el._tooltipOldBindings = binding
  // 设置原始disabled值
  opt.originDisabled = opt.disabled
  // 作为argument传入的，接收ref或者vm实例
  const popper = await getTooltipVm(vnode, binding.arg, binding.modifiers)
  if (!popper) return
  // 解绑事件
  unbindEventFn && unbindEventFn(el)
  // 初始化事件
  onEvent(el, 'mouseenter', setReference(el, popper, opt))
  onEvent(el, 'mouseleave', () => {
    if (popper.currentEl === el) {
      popper.hide()
      popper.popperJS && (popper.popperJS._reference = null)
      popper.referenceElm = popper.$refs.reference = null
    }
  })
  onEvent(el, 'focus', handleFocus(el, popper, opt))
  onEvent(el, 'blur', popper.handleBlur)
  onEvent(el, 'click', popper.removeFocusing)
}

/**
 * 处理focus获取焦点事件，当前元素存在focus，使用当前元素focus，否则tooltip提示
 * @param {dom} el
 * @param {object} popper popper对象
 * @param {object} opt 配置参数
 */
function handleFocus (el, popper, opt) {
  // 获取当前元素的vm实例，判断是否有focus事件
  const childVm = el.__vue__ || (el.children.length && el.children[0].__vue__) || el
  if (childVm && childVm.focus) {
    return childVm.focus
  } else {
    return setReference(el, popper, opt, true)
  }
}

/**
 * 解绑事件
 */
function unbindEvent (el) {
  offEvent(el, 'mouseenter')
  offEvent(el, 'mouseleave')
  offEvent(el, 'focus')
  offEvent(el, 'blur')
  offEvent(el, 'click')
}

export default {
  name: 'tooltip',
  bind (el, binding, vnode) {
    // 绑定事件
    initEvent(el, binding, vnode)
  },
  update (el, binding, vnode) {
    // vm实例不同 或者 数据变化，更新操作
    if ((binding || {}).arg !== (el._tooltipOldBindings || {}).arg ||
        JSON.stringify(binding.value) !== JSON.stringify(el._tooltipOldBindings.value)) {
      // 更新事件
      initEvent(el, binding, vnode, unbindEvent)
    }
  },
  async unbind (el, binding, vnode) {
    const popper = await getTooltipVm(vnode, binding.arg, binding.modifiers)
    // 清除当前poper提示框
    if (popper && popper.referenceElm === el) {
      popper.showPopper = false
      popper.doDestroy()
    }
    // 解绑事件
    unbindEvent(el)
  }
}

const { getTypes } = require('../../utils')
class Store {
  constructor () {
    this.store = new Map()
    this.storeEmitter = new Map()
  }

  _getValue (key) {
    return this.store.get(key)
  }

  _setValue (key, value) {
    this.store.set(key, value)
    this._emit(key)
  }

  // 触发当前store绑定事件队列
  _emit (key) {
    const keyEmitter = this.storeEmitter.get(key)

    if (Array.isArray(keyEmitter) && keyEmitter.length) {
      const value = this._getValue(key)
      keyEmitter.forEach(cb => {
        cb(value)
      })
    }
  }
  /** *************** 数据处理 ******************** */
  /**
   * 为store设置某个数据/全局补数据
   * @param {string|any} key store key值
   * @param {any?} value 要设置的数据
   */
  set (key, value) {
    const keyType = getTypes(key)
    // 对象处理
    if (keyType === 'object') {
      Object.entries(key).forEach(([i, v]) => {
        this._setValue(i, v)
      })
    } else if (keyType === 'string') {
      // 单个key值
      this._setValue(key, value)
    }
  }

  /**
   * 获取数据
   * @param {string?} key 获取key对应的值，否则返回整个store
   */
  get (key) {
    // 返回全量store
    if (key === undefined) {
      return this.store
    } else if (typeof key === 'string') {
      return this._getValue(key)
    }
  }

  // 删除某条数据
  delete (key) {
    return this.store.delete(key)
  }

  // 判断是否拥有某条数据
  has (key) {
    return this.store.has(key)
  }

  /** ****************** 全局store 事件订阅处理 ************************ */

  /**
   * 为某个key绑定事件订阅
   * @param {string} key 绑定事件key值
   * @param {function} cb 绑定的监听回调函数
   * @param {boolean} immediate 是否立即触发一次
   */
  $on (key, cb, immediate = false) {
    const keyType = getTypes(key)
    let keyEmitList = this.storeEmitter.get(key)

    if (keyType !== 'string' || cb === undefined || typeof cb !== 'function') {
      return
    }

    if (!keyEmitList) {
      this.storeEmitter.set(key, [])
    }

    this.storeEmitter.get(key).push(cb)

    if (immediate) {
      cb(this._getValue(key))
    }
  }

  /**
   * 解绑事件
   * @param {string} key 解绑事件key值
   * @param {function?} callback 需解绑事件的函数,不传时，解绑所有数据
   */
  $off (key, callback) {
    const keyType = getTypes(key)
    const keyEmitList = this.storeEmitter.get(key)
    // 数据格式校验
    if (keyType !== 'string' || !keyEmitList || !Array.isArray(keyEmitList)) {
      return
    }
    // cb为空时，off掉所有事件
    if (callback === undefined) {
      this.storeEmitter.delete(key)
      return
    }

    this.storeEmitter.set(key, keyEmitList.filter(cb => cb !== callback))
  }
}

module.exports = new Store()

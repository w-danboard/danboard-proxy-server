// 将更新后的信息，存储到localStorage中
const setLocalData = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}
// 获取存储在sessionStorage中的数据
const getLocalData = (key) => {
  try {
      let localData = window.localStorage.getItem(key)
      return JSON.parse(localData)
  } catch (e) {
      console.log(e)
  }
}

export { setLocalData, getLocalData }

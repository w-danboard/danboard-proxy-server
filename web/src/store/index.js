import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import { request } from '../plugins/request.js'


const store = new Vuex.Store({
  state: {
    workSpace: false
  },
  getters: {
    workSpace (state) {
      return state.workSpace
    }
  },
  mutations: {
    // 设置工作目录
    setWorkSpace (state, value) {
      window.localStorage.setItem('setWorkSpace', JSON.stringify(value))
      state.workSpace = value
    }
  },
  actions: {
    // 获取工作目录
    async getWorkSpace ({ commit }) {
      let res = false
      try {
        res = await request({
          url: '/project/workspace'
        }, {
          isPromptError: false
        })
      } catch {
        res = false
      } finally {
        commit('setWorkSpace', res)
      }
    }
  }
})

export default store
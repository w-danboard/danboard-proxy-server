import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import Request from './plugins/request.js'

import './assets/styles/reset.css'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.use(Request)

new Vue({
  render: h => h(App)
}).$mount('#app')
import Store from '@/store'
import ElementUI from 'element-ui'
import Vue from 'vue'
import App from './App.vue'
import Request from './plugins/request.js'

import DirectivesAll from './directives'

import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/reset.css'

Vue.use(ElementUI)
Vue.use(Request)
Vue.use(DirectivesAll)

new Vue({
  store: Store,
  render: h => h(App)
}).$mount('#app')
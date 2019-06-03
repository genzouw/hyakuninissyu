// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import Meta from 'vue-meta'
import VueAnalytics from 'vue-analytics'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/yeti/bootstrap.min.css'

Vue.use(Vuex)
Vue.use(Meta)
Vue.use(BootstrapVue)
Vue.use(VueAnalytics, {
  id: 'UA-41583079-14',
  router
})

Vue.config.productionTip = false

const app = new Vue({
  el: '#app',
  store: new Vuex.Store({
    state: {
      countOfQuestions: 10
    },
    mutations: {
      updateCountOfQuestions (state, payload) {
        state.countOfQuestions = payload
      }
    }
  }),
  router,
  components: { App },
  template: '<App/>'
})
app.$mount('#app')

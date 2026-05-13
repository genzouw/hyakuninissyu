// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Meta from 'vue-meta'
import VueAnalytics from 'vue-analytics'
import VeeValidate, { Validator } from 'vee-validate'
import ja from 'vee-validate/dist/locale/ja'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/yeti/bootstrap.min.css'

Vue.use(Meta)
Vue.use(BootstrapVue)
if (process.env.GA_ID) {
  Vue.use(VueAnalytics, {
    id: process.env.GA_ID,
    router
  })
}
Vue.use(VeeValidate)

Validator.localize('ja', ja)

Vue.config.productionTip = false

const app = new Vue({
  store,
  router,
  components: { App },
  template: '<App/>'
})
app.$mount('#app')

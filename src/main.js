// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Meta from 'vue-meta'
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
// GA4 計測タグの注入。GA_ID は webpack DefinePlugin により prod.env.js 経由で
// `vars.GA_ID` (GitHub Actions Repository Variables) の値が静的に埋め込まれる。
// 未設定時は null となり、トラッキングコードは出力されない。
// SPA ルート遷移は GA4 の Enhanced Measurement (History API) で自動計測される。
if (process.env.GA_ID) {
  const gaScript = document.createElement('script')
  gaScript.async = true
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}`
  document.head.appendChild(gaScript)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', process.env.GA_ID)
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

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Meta from 'vue-meta'
import VueAnalytics from 'vue-analytics'
import VeeValidate, {Validator} from 'vee-validate'
import ja from 'vee-validate/dist/locale/ja'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './assets/yeti/bootstrap.min.css'
import firebase from 'firebase'

Vue.use(Meta)
Vue.use(BootstrapVue)
Vue.use(VueAnalytics, {
  id: 'UA-41583079-14',
  router
})
Vue.use(VeeValidate)

Validator.localize('ja', ja)

Vue.config.productionTip = false

var firebaseConfig = {
  apiKey: 'AIzaSyCoeeYxiF64O-fcwX2e0JlrZLZ3mUNbP2c',
  authDomain: 'hyakuninissyu-genzouw-com.firebaseapp.com',
  databaseURL: 'https://hyakuninissyu-genzouw-com.firebaseio.com',
  projectId: 'hyakuninissyu-genzouw-com',
  storageBucket: 'hyakuninissyu-genzouw-com.appspot.com',
  messagingSenderId: '565783098421'
}

firebase.initializeApp(firebaseConfig)

const app = new Vue({
  store,
  router,
  components: { App },
  template: '<App/>'
})
app.$mount('#app')

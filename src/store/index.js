import Vue from 'vue'
import Vuex from 'vuex'
import timeAttack from './modules/timeAttack'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    countOfQuestions: 10,
    user: null
  },
  mutations: {
    updateCountOfQuestions (state, payload) {
      state.countOfQuestions = payload
    },
    updateUser (state, user) {
      state.user = user
    }
  },
  modules: {
    timeAttack
  }
})

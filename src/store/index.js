import Vue from 'vue'
import Vuex from 'vuex'
import timeAttack from './modules/timeAttack'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    countOfQuestions: 10
  },
  mutations: {
    updateCountOfQuestions (state, payload) {
      state.countOfQuestions = payload
    }
  },
  modules: {
    timeAttack
  }
})

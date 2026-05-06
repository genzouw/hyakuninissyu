import Vue from 'vue'
import Vuex from 'vuex'
import timeAttack from './modules/timeAttack'
import collection from './modules/collection'
import createPersistencePlugin from './plugins/persistence'

Vue.use(Vuex)

const persistencePlugin = createPersistencePlugin([
  { path: 'collection.collectedPoemIds', key: 'collectedPoemIds', default: [] }
])

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
    timeAttack,
    collection
  },
  plugins: [persistencePlugin]
})

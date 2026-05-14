import { createStore } from 'vuex'
import timeAttack from './modules/timeAttack'
import collection from './modules/collection'
import createPersistencePlugin from './plugins/persistence'

const persistencePlugin = createPersistencePlugin([
  { path: 'collection.collectedPoemIds', key: 'collectedPoemIds', default: [] },
])

export default createStore({
  state: {
    countOfQuestions: 10,
  },
  mutations: {
    updateCountOfQuestions (state, payload) {
      state.countOfQuestions = payload
    },
  },
  modules: {
    timeAttack,
    collection,
  },
  plugins: [persistencePlugin],
})

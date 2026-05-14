const state = {
  collectedPoemIds: []
}

const mutations = {
  ADD_COLLECTED_POEM (state, poemId) {
    if (!state.collectedPoemIds.includes(poemId)) {
      state.collectedPoemIds.push(poemId)
    }
  },
  RESET_COLLECTED (state) {
    state.collectedPoemIds = []
  }
}

const actions = {
  addCollectedPoem ({ commit }, poemId) {
    commit('ADD_COLLECTED_POEM', poemId)
  },
  resetCollected ({ commit }) {
    commit('RESET_COLLECTED')
  }
}

const getters = {
  collectedCount: state => state.collectedPoemIds.length,
  collectedPoemIdSet: state => new Set(state.collectedPoemIds),
  isCollected: (state, getters) => poemId => getters.collectedPoemIdSet.has(poemId)
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

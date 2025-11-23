const state = {
  startTime: null,
  currentTime: null,
  elapsedTime: 0,
  isPlaying: false,
  remainingCards: 100,
  timer: null
}

const mutations = {
  START_GAME (state) {
    state.startTime = Date.now()
    state.currentTime = Date.now()
    state.isPlaying = true
    state.remainingCards = 100
    state.elapsedTime = 0
  },
  UPDATE_TIME (state) {
    if (state.isPlaying) {
      state.currentTime = Date.now()
      state.elapsedTime = state.currentTime - state.startTime
    }
  },
  DECREASE_REMAINING_CARDS (state) {
    if (state.remainingCards > 0) {
      state.remainingCards--
    }
  },
  STOP_GAME (state) {
    state.isPlaying = false
    if (state.timer) {
      clearInterval(state.timer)
      state.timer = null
    }
  },
  SET_TIMER (state, timer) {
    state.timer = timer
  },
  RESET_GAME (state) {
    state.startTime = null
    state.currentTime = null
    state.elapsedTime = 0
    state.isPlaying = false
    state.remainingCards = 100
    if (state.timer) {
      clearInterval(state.timer)
      state.timer = null
    }
  }
}

const actions = {
  startGame ({ commit }) {
    commit('START_GAME')
    const timer = setInterval(() => {
      commit('UPDATE_TIME')
    }, 100) // 100msごとに更新
    commit('SET_TIMER', timer)
  },
  answerCard ({ commit }) {
    commit('DECREASE_REMAINING_CARDS')
  },
  stopGame ({ commit }) {
    commit('STOP_GAME')
  },
  resetGame ({ commit }) {
    commit('RESET_GAME')
  }
}

const getters = {
  formattedTime: state => {
    const seconds = Math.floor(state.elapsedTime / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    const milliseconds = Math.floor((state.elapsedTime % 1000) / 10)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  },
  isGameFinished: state => state.remainingCards === 0,
  elapsedTimeMs: state => state.elapsedTime
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

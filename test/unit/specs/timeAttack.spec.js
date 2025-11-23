import timeAttack from '@/store/modules/timeAttack'

describe('timeAttack Vuex module', () => {
  let state

  beforeEach(() => {
    state = {
      startTime: null,
      currentTime: null,
      elapsedTime: 0,
      isPlaying: false,
      remainingCards: 100,
      timer: null
    }
  })

  describe('mutations', () => {
    it('START_GAME should initialize game state', () => {
      const now = Date.now()
      jest.spyOn(Date, 'now').mockReturnValue(now)

      timeAttack.mutations.START_GAME(state)

      expect(state.startTime).toBe(now)
      expect(state.currentTime).toBe(now)
      expect(state.isPlaying).toBe(true)
      expect(state.remainingCards).toBe(100)
      expect(state.elapsedTime).toBe(0)
    })

    it('UPDATE_TIME should calculate elapsed time correctly', () => {
      const startTime = 1000
      state.startTime = startTime
      state.isPlaying = true

      const currentTime = 5500
      jest.spyOn(Date, 'now').mockReturnValue(currentTime)

      timeAttack.mutations.UPDATE_TIME(state)

      expect(state.currentTime).toBe(currentTime)
      expect(state.elapsedTime).toBe(4500)
    })

    it('UPDATE_TIME should not update when not playing', () => {
      state.startTime = 1000
      state.isPlaying = false
      const initialElapsedTime = state.elapsedTime

      timeAttack.mutations.UPDATE_TIME(state)

      expect(state.elapsedTime).toBe(initialElapsedTime)
    })

    it('DECREASE_REMAINING_CARDS should decrement remaining cards', () => {
      state.remainingCards = 50

      timeAttack.mutations.DECREASE_REMAINING_CARDS(state)

      expect(state.remainingCards).toBe(49)
    })

    it('DECREASE_REMAINING_CARDS should not go below 0', () => {
      state.remainingCards = 0

      timeAttack.mutations.DECREASE_REMAINING_CARDS(state)

      expect(state.remainingCards).toBe(0)
    })

    it('STOP_GAME should stop the game', () => {
      const mockTimer = setInterval(() => {}, 100)
      state.timer = mockTimer
      state.isPlaying = true

      timeAttack.mutations.STOP_GAME(state)

      expect(state.isPlaying).toBe(false)
      expect(state.timer).toBe(null)
    })

    it('RESET_GAME should reset all state to initial values', () => {
      state.startTime = 1000
      state.currentTime = 5000
      state.elapsedTime = 4000
      state.isPlaying = true
      state.remainingCards = 50
      state.timer = setInterval(() => {}, 100)

      timeAttack.mutations.RESET_GAME(state)

      expect(state.startTime).toBe(null)
      expect(state.currentTime).toBe(null)
      expect(state.elapsedTime).toBe(0)
      expect(state.isPlaying).toBe(false)
      expect(state.remainingCards).toBe(100)
      expect(state.timer).toBe(null)
    })
  })

  describe('getters', () => {
    it('formattedTime should format time correctly', () => {
      state.elapsedTime = 125340 // 2分5秒340ミリ秒

      const formatted = timeAttack.getters.formattedTime(state)

      expect(formatted).toBe('02:05.34')
    })

    it('formattedTime should handle zero', () => {
      state.elapsedTime = 0

      const formatted = timeAttack.getters.formattedTime(state)

      expect(formatted).toBe('00:00.00')
    })

    it('isGameFinished should return true when all cards are taken', () => {
      state.remainingCards = 0

      const finished = timeAttack.getters.isGameFinished(state)

      expect(finished).toBe(true)
    })

    it('isGameFinished should return false when cards remain', () => {
      state.remainingCards = 1

      const finished = timeAttack.getters.isGameFinished(state)

      expect(finished).toBe(false)
    })

    it('elapsedTimeMs should return elapsed time in milliseconds', () => {
      state.elapsedTime = 12345

      const elapsed = timeAttack.getters.elapsedTimeMs(state)

      expect(elapsed).toBe(12345)
    })
  })
})

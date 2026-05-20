import collection from '@/store/modules/collection'

describe('collection Vuex module', () => {
  let state

  beforeEach(() => {
    state = {
      collectedPoemIds: [],
    }
  })

  describe('mutations', () => {
    it('ADD_COLLECTED_POEM should append a new poemId', () => {
      collection.mutations.ADD_COLLECTED_POEM(state, 5)
      expect(state.collectedPoemIds).toEqual([5])
    })

    it('ADD_COLLECTED_POEM should not duplicate existing poemId', () => {
      state.collectedPoemIds = [1, 2]
      collection.mutations.ADD_COLLECTED_POEM(state, 1)
      expect(state.collectedPoemIds).toEqual([1, 2])
    })

    it('RESET_COLLECTED should empty collectedPoemIds', () => {
      state.collectedPoemIds = [1, 2, 3]
      collection.mutations.RESET_COLLECTED(state)
      expect(state.collectedPoemIds).toEqual([])
    })
  })

  describe('actions', () => {
    it('addCollectedPoem should commit ADD_COLLECTED_POEM with the poemId', () => {
      const commit = jest.fn()
      collection.actions.addCollectedPoem({ commit, state }, 7)
      expect(commit).toHaveBeenCalledWith('ADD_COLLECTED_POEM', 7)
    })

    it('addCollectedPoem should return true when the poem is newly added', () => {
      const commit = jest.fn()
      const result = collection.actions.addCollectedPoem({ commit, state }, 7)
      expect(result).toBe(true)
    })

    it('addCollectedPoem should return false when the poem is already collected', () => {
      state.collectedPoemIds = [7]
      const commit = jest.fn()
      const result = collection.actions.addCollectedPoem({ commit, state }, 7)
      expect(result).toBe(false)
    })

    it('resetCollected should commit RESET_COLLECTED', () => {
      const commit = jest.fn()
      collection.actions.resetCollected({ commit })
      expect(commit).toHaveBeenCalledWith('RESET_COLLECTED')
    })
  })

  describe('getters', () => {
    it('collectedCount should return the number of collected poems', () => {
      state.collectedPoemIds = [1, 2, 3, 4]
      expect(collection.getters.collectedCount(state)).toBe(4)
    })

    it('collectedPoemIdSet should return a Set of collected poemIds', () => {
      state.collectedPoemIds = [1, 2, 3]
      const result = collection.getters.collectedPoemIdSet(state)
      expect(result).toBeInstanceOf(Set)
      expect(result.has(1)).toBe(true)
      expect(result.has(99)).toBe(false)
    })

    it('isCollected should return true for collected poemIds and false otherwise', () => {
      state.collectedPoemIds = [1, 5, 10]
      const set = collection.getters.collectedPoemIdSet(state)
      const isCollected = collection.getters.isCollected(state, {
        collectedPoemIdSet: set,
      })
      expect(isCollected(1)).toBe(true)
      expect(isCollected(10)).toBe(true)
      expect(isCollected(2)).toBe(false)
    })
  })
})

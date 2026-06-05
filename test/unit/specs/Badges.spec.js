const { describe, it, expect, beforeEach } = globalThis

import { mount } from '@vue/test-utils'
import { createStore as createVuexStore } from 'vuex'
import { createBootstrap } from 'bootstrap-vue-next'
import Badges from '@/components/Badges'
import collectionModule from '@/store/modules/collection'

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function createStore (collectedPoemIds = []) {
  return createVuexStore({
    modules: {
      collection: {
        ...collectionModule,
        state: { collectedPoemIds: collectedPoemIds.slice() },
      },
    },
  })
}

function mountBadges (collectedPoemIds = []) {
  return mount(Badges, {
    global: { plugins: [createStore(collectedPoemIds), createBootstrap()] },
  })
}

describe('Badges.vue', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  it('should render correct title', () => {
    const wrapper = mountBadges()
    expect(wrapper.find('h2').text()).toContain('バッジコレクション')
  })

  it('should calculate total badges correctly', () => {
    const wrapper = mountBadges()
    expect(wrapper.vm.totalBadges).toBe(14)
  })

  it('should calculate unlocked count correctly', () => {
    const wrapper = mountBadges()
    wrapper.vm.unlockedBadgeIds = ['beginner', 'learner', 'enthusiast']
    expect(wrapper.vm.unlockedCount).toBe(3)
  })

  it('should calculate badge rate correctly', () => {
    const wrapper = mountBadges()
    wrapper.vm.unlockedBadgeIds = ['beginner', 'learner']
    expect(wrapper.vm.badgeRate).toBe(14) // 2/14 = 14.28% -> 14%
  })

  it('should identify unlocked badges', () => {
    const wrapper = mountBadges()
    wrapper.vm.unlockedBadgeIds = ['beginner', 'master']
    expect(wrapper.vm.isUnlocked('beginner')).toBe(true)
    expect(wrapper.vm.isUnlocked('master')).toBe(true)
    expect(wrapper.vm.isUnlocked('learner')).toBe(false)
  })

  it('should filter badges by rarity', () => {
    const wrapper = mountBadges()
    wrapper.vm.rarityFilter = 'common'
    const filteredBadges = wrapper.vm.filteredBadges
    expect(filteredBadges.every((b) => b.rarity === 'common')).toBe(true)
  })

  it('should show all badges when filter is "all"', () => {
    const wrapper = mountBadges()
    wrapper.vm.rarityFilter = 'all'
    expect(wrapper.vm.filteredBadges.length).toBe(14)
  })

  it('should clear unlockedBadgeIds and localStorage if JSON.parse fails', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // Set invalid JSON ONLY for 'unlockedBadgeIds' to avoid affecting other components that might use localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'unlockedBadgeIds') return 'invalid-json'
      return null
    })

    // mountBadges triggers mounted() -> loadUnlockedBadges()
    const wrapper = mountBadges()

    // Assert error was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse unlockedBadgeIds from localStorage:',
      expect.any(Error)
    )
    expect(consoleSpy).toHaveBeenCalledTimes(1)

    // Assert array is reset
    expect(wrapper.vm.unlockedBadgeIds).toEqual([])

    // Assert localStorage.removeItem was called
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('unlockedBadgeIds')
    expect(localStorageMock.removeItem).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })
})

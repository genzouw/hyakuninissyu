import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import Badges from '@/components/Badges'
import collectionModule from '@/store/modules/collection'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(BootstrapVue)

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

function createStore (collectedPoemIds = []) {
  return new Vuex.Store({
    modules: {
      collection: {
        ...collectionModule,
        state: { collectedPoemIds: collectedPoemIds.slice() },
      },
    },
  })
}

function mountBadges (collectedPoemIds = []) {
  return mount(Badges, { localVue, store: createStore(collectedPoemIds) })
}

describe('Badges.vue', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
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
})

import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Badges from '@/components/Badges'

Vue.use(BootstrapVue)

// localStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

describe('Badges.vue', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
  })

  it('should render correct title', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('h2').textContent).toContain('バッジコレクション')
  })

  it('should calculate total badges correctly', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor().$mount()
    expect(vm.totalBadges).toBe(14)
  })

  it('should calculate unlocked count correctly', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor()
    vm.unlockedBadgeIds = ['beginner', 'learner', 'enthusiast']
    vm.$mount()
    expect(vm.unlockedCount).toBe(3)
  })

  it('should calculate badge rate correctly', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor()
    vm.unlockedBadgeIds = ['beginner', 'learner']
    vm.$mount()
    expect(vm.badgeRate).toBe(14) // 2/14 = 14.28% -> 14%
  })

  it('should identify unlocked badges', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor()
    vm.unlockedBadgeIds = ['beginner', 'master']
    vm.$mount()
    expect(vm.isUnlocked('beginner')).toBe(true)
    expect(vm.isUnlocked('master')).toBe(true)
    expect(vm.isUnlocked('learner')).toBe(false)
  })

  it('should filter badges by rarity', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor()
    vm.rarityFilter = 'common'
    vm.$mount()
    const filteredBadges = vm.filteredBadges
    expect(filteredBadges.every(b => b.rarity === 'common')).toBe(true)
  })

  it('should show all badges when filter is "all"', () => {
    const Constructor = Vue.extend(Badges)
    const vm = new Constructor()
    vm.rarityFilter = 'all'
    vm.$mount()
    expect(vm.filteredBadges.length).toBe(14)
  })
})

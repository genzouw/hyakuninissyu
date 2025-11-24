import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import Collection from '@/components/Collection'

// Bootstrap-Vueを登録
Vue.use(BootstrapVue)

// localStorageをモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

describe('Collection.vue', () => {
  let vm

  beforeEach(() => {
    // localStorageをリセット
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.clear.mockClear()

    const Constructor = Vue.extend(Collection)
    vm = new Constructor().$mount()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  it('should render component title', () => {
    const title = vm.$el.querySelector('h2')
    expect(title.textContent).toContain('百人一首コレクション図鑑')
  })

  it('should calculate total count correctly', () => {
    expect(vm.totalCount).toBe(100)
  })

  it('should calculate collection rate correctly', () => {
    vm.collectedPoemIds = [1, 2, 3, 4, 5]
    expect(vm.collectedCount).toBe(5)
    expect(vm.collectionRate).toBe(5)
  })

  it('should calculate collection rate as 0 when no poems collected', () => {
    vm.collectedPoemIds = []
    expect(vm.collectionRate).toBe(0)
  })

  it('should identify collected poems correctly', () => {
    vm.collectedPoemIds = [1, 5, 10]
    expect(vm.isCollected(1)).toBe(true)
    expect(vm.isCollected(5)).toBe(true)
    expect(vm.isCollected(10)).toBe(true)
    expect(vm.isCollected(2)).toBe(false)
    expect(vm.isCollected(100)).toBe(false)
  })

  it('should filter poems by "all" filter', () => {
    vm.collectedPoemIds = [1, 2, 3]
    vm.filter = 'all'
    expect(vm.filteredPoems.length).toBe(100)
  })

  it('should filter poems by "collected" filter', () => {
    vm.collectedPoemIds = [1, 2, 3]
    vm.filter = 'collected'
    expect(vm.filteredPoems.length).toBe(3)
    expect(vm.filteredPoems.every(p => vm.isCollected(p.id))).toBe(true)
  })

  it('should filter poems by "uncollected" filter', () => {
    vm.collectedPoemIds = [1, 2, 3]
    vm.filter = 'uncollected'
    expect(vm.filteredPoems.length).toBe(97)
    expect(vm.filteredPoems.every(p => !vm.isCollected(p.id))).toBe(true)
  })

  it('should show poem detail when showPoemDetail is called', () => {
    const poem = { id: 1, question: 'test question', answer: 'test answer', author: 'test author' }
    vm.showPoemDetail(poem)
    expect(vm.selectedPoem).toEqual(poem)
    expect(vm.showModal).toBe(true)
  })
})

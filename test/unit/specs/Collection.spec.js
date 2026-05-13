import Vue from 'vue'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'
import Collection from '@/components/Collection'
import collectionModule from '@/store/modules/collection'

Vue.use(BootstrapVue)
Vue.use(Vuex)

function createStore (collectedPoemIds = []) {
  return new Vuex.Store({
    modules: {
      collection: {
        ...collectionModule,
        state: { collectedPoemIds: collectedPoemIds.slice() }
      }
    }
  })
}

describe('Collection.vue', () => {
  let vm

  function mount (collectedPoemIds = []) {
    const store = createStore(collectedPoemIds)
    const Constructor = Vue.extend(Collection)
    vm = new Constructor({ store }).$mount()
    return vm
  }

  it('should render component title', () => {
    mount()
    const title = vm.$el.querySelector('h2')
    expect(title.textContent).toContain('百人一首コレクション図鑑')
  })

  it('should calculate total count correctly', () => {
    mount()
    expect(vm.totalCount).toBe(100)
  })

  it('should calculate collection rate correctly', () => {
    mount([1, 2, 3, 4, 5])
    expect(vm.collectedCount).toBe(5)
    expect(vm.collectionRate).toBe(5)
  })

  it('should calculate collection rate as 0 when no poems collected', () => {
    mount([])
    expect(vm.collectionRate).toBe(0)
  })

  it('should identify collected poems correctly', () => {
    mount([1, 5, 10])
    expect(vm.isCollected(1)).toBe(true)
    expect(vm.isCollected(5)).toBe(true)
    expect(vm.isCollected(10)).toBe(true)
    expect(vm.isCollected(2)).toBe(false)
    expect(vm.isCollected(100)).toBe(false)
  })

  it('should filter poems by "all" filter', () => {
    mount([1, 2, 3])
    vm.filter = 'all'
    expect(vm.filteredPoems.length).toBe(100)
  })

  it('should filter poems by "collected" filter', () => {
    mount([1, 2, 3])
    vm.filter = 'collected'
    expect(vm.filteredPoems.length).toBe(3)
    expect(vm.filteredPoems.every(p => vm.isCollected(p.id))).toBe(true)
  })

  it('should filter poems by "uncollected" filter', () => {
    mount([1, 2, 3])
    vm.filter = 'uncollected'
    expect(vm.filteredPoems.length).toBe(97)
    expect(vm.filteredPoems.every(p => !vm.isCollected(p.id))).toBe(true)
  })

  it('should show poem detail when showPoemDetail is called', () => {
    mount()
    const poem = { id: 1, question: 'test question', answer: 'test answer', author: 'test author' }
    vm.showPoemDetail(poem)
    expect(vm.selectedPoem).toEqual(poem)
    expect(vm.showModal).toBe(true)
  })
})

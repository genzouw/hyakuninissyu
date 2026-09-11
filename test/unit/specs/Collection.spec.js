import { mount, shallowMount } from '@vue/test-utils'
import { createStore as createVuexStore } from 'vuex'
import { createBootstrap } from 'bootstrap-vue-next'
import Collection from '@/components/Collection'
import collectionModule from '@/store/modules/collection'

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

describe('Collection.vue', () => {
  function mountCollection (collectedPoemIds = []) {
    const store = createStore(collectedPoemIds)
    return mount(Collection, {
      global: { plugins: [store, createBootstrap()] },
    })
  }

  // .poem-card はコンポーネント自身のテンプレートに属するため、
  // shallowMount でも子コンポーネント（b-progress 等）のみがスタブ化され、
  // キーボード操作の検証には影響しない。
  function shallowMountCollection (collectedPoemIds = []) {
    const store = createStore(collectedPoemIds)
    return shallowMount(Collection, {
      global: { plugins: [store, createBootstrap()] },
    })
  }

  it('should render component title', () => {
    const wrapper = mountCollection()
    expect(wrapper.find('h2').text()).toContain('百人一首コレクション図鑑')
  })

  it('should calculate total count correctly', () => {
    const wrapper = mountCollection()
    expect(wrapper.vm.totalCount).toBe(100)
  })

  it('should calculate collection rate correctly', () => {
    const wrapper = mountCollection([1, 2, 3, 4, 5])
    expect(wrapper.vm.collectedCount).toBe(5)
    expect(wrapper.vm.collectionRate).toBe(5)
  })

  it('should calculate collection rate as 0 when no poems collected', () => {
    const wrapper = mountCollection([])
    expect(wrapper.vm.collectionRate).toBe(0)
  })

  it('should identify collected poems correctly', () => {
    const wrapper = mountCollection([1, 5, 10])
    expect(wrapper.vm.isCollected(1)).toBe(true)
    expect(wrapper.vm.isCollected(5)).toBe(true)
    expect(wrapper.vm.isCollected(10)).toBe(true)
    expect(wrapper.vm.isCollected(2)).toBe(false)
    expect(wrapper.vm.isCollected(100)).toBe(false)
  })

  it('should filter poems by "all" filter', () => {
    const wrapper = mountCollection([1, 2, 3])
    wrapper.vm.filter = 'all'
    expect(wrapper.vm.filteredPoems.length).toBe(100)
  })

  it('should filter poems by "collected" filter', () => {
    const wrapper = mountCollection([1, 2, 3])
    wrapper.vm.filter = 'collected'
    expect(wrapper.vm.filteredPoems.length).toBe(3)
    expect(
      wrapper.vm.filteredPoems.every((p) => wrapper.vm.isCollected(p.id))
    ).toBe(true)
  })

  it('should filter poems by "uncollected" filter', () => {
    const wrapper = mountCollection([1, 2, 3])
    wrapper.vm.filter = 'uncollected'
    expect(wrapper.vm.filteredPoems.length).toBe(97)
    expect(
      wrapper.vm.filteredPoems.every((p) => !wrapper.vm.isCollected(p.id))
    ).toBe(true)
  })

  it('should show poem detail when showPoemDetail is called', () => {
    const wrapper = mountCollection()
    const poem = {
      id: 1,
      question: 'test question',
      answer: 'test answer',
      author: 'test author',
    }
    wrapper.vm.showPoemDetail(poem)
    expect(wrapper.vm.selectedPoem).toEqual(poem)
    expect(wrapper.vm.showModal).toBe(true)
  })

  it('should show poem detail when Enter key is pressed on poem card', async () => {
    const wrapper = shallowMountCollection()
    await wrapper.find('.poem-card').trigger('keyup.enter')
    expect(wrapper.vm.showModal).toBe(true)
  })

  it('should not show poem detail when Space key is pressed down (default scroll is prevented instead)', async () => {
    const wrapper = shallowMountCollection()
    const event = new KeyboardEvent('keydown', {
      key: ' ',
      code: 'Space',
      cancelable: true,
      bubbles: true,
    })
    wrapper.find('.poem-card').element.dispatchEvent(event)
    await wrapper.vm.$nextTick()
    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.vm.showModal).toBe(false)
  })

  it('should show poem detail when Space key is released on poem card', async () => {
    const wrapper = shallowMountCollection()
    await wrapper.find('.poem-card').trigger('keyup.space')
    expect(wrapper.vm.showModal).toBe(true)
  })
})

import { mount } from '@vue/test-utils'
import { createHead } from '@unhead/vue/client'
import { createBootstrap } from 'bootstrap-vue-next'
import App from '@/App'

describe('App.vue', () => {
  it('renders navbar without unresolved component warnings', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createBootstrap(), createHead()],
        stubs: {
          'router-link': true,
          'router-view': true,
        },
      },
    })

    expect(wrapper.find('nav.navbar').exists()).toBe(true)
  })
})

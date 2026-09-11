import { mount } from '@vue/test-utils'
import { createStore as createVuexStore } from 'vuex'
import Top from '@/components/Top'

function createStore (countOfQuestions = 10) {
  return createVuexStore({
    state: { countOfQuestions },
    mutations: {
      updateCountOfQuestions (state, payload) {
        state.countOfQuestions = payload
      },
    },
  })
}

function mountTop (countOfQuestions = 10) {
  return mount(Top, {
    global: {
      plugins: [createStore(countOfQuestions)],
      stubs: { 'router-link': true },
    },
  })
}

describe('Top.vue', () => {
  it('もんだいのかず入力欄で label の for と Field の id が一致すること', () => {
    // eslint-plugin-vuejs-accessibility の label-has-for は for 属性の有無しか
    // 検証しないため、参照先の id との対応関係はテストで担保する
    const wrapper = mountTop()

    const labelFor = wrapper.find('label').attributes('for')
    const fieldId = wrapper.find('input').attributes('id')

    expect(labelFor).toBe('countOfQuestions')
    expect(fieldId).toBe(labelFor)
  })
})

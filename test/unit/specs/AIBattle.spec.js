import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

const localVue = createLocalVue()
localVue.use(Vuex)

global.SpeechSynthesisUtterance = function () {
  return { pitch: 1, lang: '', text: '' }
}
global.speechSynthesis = {
  cancel () {},
  speak () {},
}

const AIBattle = require('@/components/AIBattle').default

function createStore () {
  const dispatch = jest.fn()
  const store = new Vuex.Store({
    modules: {
      collection: {
        namespaced: true,
        state: { collectedPoemIds: [] },
        actions: { addCollectedPoem: jest.fn() },
      },
    },
  })
  store.dispatch = dispatch
  return { store, dispatch }
}

function setup ({ correctIndex = 1, currentQuestionId = 1 } = {}) {
  const { store, dispatch } = createStore()
  const wrapper = shallowMount(AIBattle, {
    localVue,
    store,
    mocks: {
      $router: { push: jest.fn() },
    },
    data () {
      return {
        canAnswer: true,
        roundFinished: false,
        correctAnswerIndex: correctIndex,
        currentQuestion: { id: currentQuestionId, question: 'q', answer: 'a' },
        aiTimeout: null,
        enableSpeak: false,
      }
    },
  })
  const vm = wrapper.vm
  return { wrapper, vm, dispatch }
}

describe('AIBattle.vue', () => {
  describe('selectAnswer', () => {
    it('should dispatch collection/addCollectedPoem when player answer is correct', () => {
      const { vm, dispatch } = setup({
        correctIndex: 1,
        currentQuestionId: 25,
      })
      vm.selectAnswer(1)
      expect(dispatch).toHaveBeenCalledWith('collection/addCollectedPoem', 25)
    })

    it('should NOT dispatch when player answer is wrong', () => {
      const { vm, dispatch } = setup({
        correctIndex: 1,
        currentQuestionId: 25,
      })
      vm.selectAnswer(2)
      expect(dispatch).not.toHaveBeenCalledWith(
        'collection/addCollectedPoem',
        expect.anything()
      )
    })

    it('should increment playerScore on correct answer', () => {
      const { vm } = setup({ correctIndex: 0, currentQuestionId: 1 })
      const before = vm.playerScore
      vm.selectAnswer(0)
      expect(vm.playerScore).toBe(before + 1)
    })
  })
})

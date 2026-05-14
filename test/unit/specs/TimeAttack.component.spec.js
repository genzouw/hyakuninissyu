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

const TimeAttack = require('@/components/TimeAttack').default

function createStore () {
  const dispatch = jest.fn()
  const store = new Vuex.Store({
    modules: {
      collection: {
        namespaced: true,
        state: { collectedPoemIds: [] },
        actions: { addCollectedPoem: jest.fn() },
      },
      timeAttack: {
        namespaced: true,
        state: { remainingCards: 100 },
        actions: {
          startGame: jest.fn(),
          answerCard: jest.fn(),
          stopGame: jest.fn(),
        },
      },
    },
  })
  store.dispatch = dispatch
  return { store, dispatch }
}

function mountWithQuestion (questionData) {
  const { store, dispatch } = createStore()
  document.body.innerHTML =
    '<audio id="right-sound"></audio><audio id="wrong-sound"></audio>'
  HTMLMediaElement.prototype.play = jest.fn()
  const wrapper = shallowMount(TimeAttack, { localVue, store })
  const vm = wrapper.vm
  vm.questionData = questionData
  vm.thinking = true
  vm.enableSpeak = false
  return { wrapper, vm, dispatch }
}

describe('TimeAttack.vue', () => {
  describe('clickAnswer', () => {
    it('should dispatch collection/addCollectedPoem when answer is correct', () => {
      const { vm, dispatch } = mountWithQuestion({
        id: 7,
        question: 'q',
        answer: 'a',
        choices: ['a', 'b', 'c', 'd'],
      })
      vm.choice = 'a'
      vm.clickAnswer()
      expect(dispatch).toHaveBeenCalledWith('collection/addCollectedPoem', 7)
    })

    it('should NOT dispatch collection/addCollectedPoem when answer is wrong', () => {
      const { vm, dispatch } = mountWithQuestion({
        id: 7,
        question: 'q',
        answer: 'a',
        choices: ['a', 'b', 'c', 'd'],
      })
      vm.choice = 'b'
      vm.clickAnswer()
      expect(dispatch).not.toHaveBeenCalledWith(
        'collection/addCollectedPoem',
        expect.anything()
      )
    })

    it('should increment score on correct answer', () => {
      const { vm } = mountWithQuestion({
        id: 1,
        question: 'q',
        answer: 'a',
        choices: ['a'],
      })
      vm.choice = 'a'
      const before = vm.score
      vm.clickAnswer()
      expect(vm.score).toBe(before + 1)
    })
  })
})

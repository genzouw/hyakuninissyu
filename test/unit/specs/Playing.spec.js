import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

// Playing.vue は data() で new SpeechSynthesisUtterance() を呼ぶため、
// jsdom 環境ではグローバルにスタブを用意する必要がある。
global.SpeechSynthesisUtterance = function () {
  return { pitch: 1, lang: '', text: '' }
}
global.speechSynthesis = {
  cancel () {},
  speak () {}
}

// import は data() 評価より先に実行されるため、SpeechSynthesisUtterance のスタブ後に require する
const Playing = require('@/components/Playing').default

function createStore () {
  const dispatch = jest.fn()
  const store = new Vuex.Store({
    modules: {
      collection: {
        namespaced: true,
        state: { collectedPoemIds: [] },
        actions: { addCollectedPoem: jest.fn() }
      }
    }
  })
  store.dispatch = dispatch
  return { store, dispatch }
}

function mountWithQuestion (questionData) {
  const { store, dispatch } = createStore()
  const Constructor = Vue.extend(Playing)
  // mounted を実行させないために $mount を呼ばずにインスタンスのみ生成
  const vm = new Constructor({ store })
  vm.$route = { params: { countOfQuestions: 10 } }
  vm.questionData = questionData
  vm.thinking = true
  vm.enableSpeak = false
  // clickAnswer 内の document.getElementById('right-sound')/('wrong-sound') 用にスタブ
  document.body.innerHTML =
    '<audio id="right-sound"></audio><audio id="wrong-sound"></audio>'
  HTMLMediaElement.prototype.play = jest.fn()
  return { vm, dispatch }
}

describe('Playing.vue', () => {
  describe('clickAnswer', () => {
    it('should dispatch collection/addCollectedPoem when answer is correct', () => {
      const { vm, dispatch } = mountWithQuestion({
        id: 42,
        question: 'q',
        answer: 'a',
        choices: ['a', 'b', 'c', 'd']
      })
      vm.choice = 'a'
      vm.clickAnswer()
      expect(dispatch).toHaveBeenCalledWith('collection/addCollectedPoem', 42)
    })

    it('should NOT dispatch collection/addCollectedPoem when answer is wrong', () => {
      const { vm, dispatch } = mountWithQuestion({
        id: 42,
        question: 'q',
        answer: 'a',
        choices: ['a', 'b', 'c', 'd']
      })
      vm.choice = 'b'
      vm.clickAnswer()
      expect(dispatch).not.toHaveBeenCalled()
    })

    it('should increment score on correct answer', () => {
      const { vm } = mountWithQuestion({
        id: 1,
        question: 'q',
        answer: 'a',
        choices: ['a']
      })
      vm.choice = 'a'
      const before = vm.score
      vm.clickAnswer()
      expect(vm.score).toBe(before + 1)
    })
  })
})

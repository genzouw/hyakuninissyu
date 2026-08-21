import { mount } from '@vue/test-utils'

// useSpeech は import 時ではなく呼び出し時に Web Speech API の有無を判定するため、
// テストごとにグローバルのスタブを差し替えられる。
const { useSpeech } = require('@/composables/useSpeech')

// 呼び出し履歴を検証するためのスタブ。cancel / speak の呼び出し順も記録する。
function createSpeechStub () {
  const calls = []
  const utterances = []

  class UtteranceStub {
    constructor (text) {
      this.text = text
      this.pitch = null
      this.lang = null
      utterances.push(this)
    }
  }

  return {
    calls,
    utterances,
    UtteranceStub,
    speechSynthesis: {
      cancel (...args) {
        calls.push({ name: 'cancel', args })
      },
      speak (utterance) {
        calls.push({ name: 'speak', args: [utterance] })
      },
    },
  }
}

// setup() 内で useSpeech() を呼ぶダミーコンポーネント。
// composable 側に onUnmounted などのライフサイクルを足してもそのまま動く。
function mountUseSpeech () {
  let api = null
  const wrapper = mount({
    setup () {
      api = useSpeech()
      return () => null
    },
  })
  return { wrapper, api }
}

describe('useSpeech', () => {
  let stub

  beforeEach(() => {
    stub = createSpeechStub()
    global.SpeechSynthesisUtterance = stub.UtteranceStub
    global.speechSynthesis = stub.speechSynthesis
  })

  afterEach(() => {
    delete global.SpeechSynthesisUtterance
    delete global.speechSynthesis
  })

  describe('Web Speech API 対応環境', () => {
    it('enableSpeak は true で初期化される', () => {
      const { wrapper, api } = mountUseSpeech()
      expect(api.isSupported).toBe(true)
      expect(api.enableSpeak.value).toBe(true)
      wrapper.unmount()
    })

    it('enableSpeak が false のとき speak は呼ばれない', () => {
      const { wrapper, api } = mountUseSpeech()
      api.enableSpeak.value = false
      stub.calls.length = 0

      api.speakText('あきのたの')

      expect(stub.calls.filter((c) => c.name === 'speak')).toHaveLength(0)
      wrapper.unmount()
    })

    it('speakText は speak の前に cancel を呼ぶ', () => {
      const { wrapper, api } = mountUseSpeech()
      stub.calls.length = 0

      api.speakText('あきのたの')

      expect(stub.calls.map((c) => c.name)).toEqual(['cancel', 'speak'])
      wrapper.unmount()
    })

    it('cancel は引数なしで呼ばれる', () => {
      const { wrapper, api } = mountUseSpeech()
      stub.calls.length = 0

      api.speakText('あきのたの')

      const cancelCalls = stub.calls.filter((c) => c.name === 'cancel')
      expect(cancelCalls).toHaveLength(1)
      expect(cancelCalls[0].args).toEqual([])
      wrapper.unmount()
    })

    it('speakText は発話ごとに新しい utterance を生成する', () => {
      const { wrapper, api } = mountUseSpeech()

      api.speakText('あきのたの')
      api.speakText('はるすぎて')

      expect(stub.utterances).toHaveLength(2)
      expect(stub.utterances[0]).not.toBe(stub.utterances[1])
      expect(stub.utterances[1].text).toBe('はるすぎて')
      expect(stub.utterances[1].lang).toBe('ja-JP')
      expect(stub.utterances[1].pitch).toBe(1)
      wrapper.unmount()
    })

    it('toggleSpeak で false にしたとき cancel が呼ばれる', () => {
      const { wrapper, api } = mountUseSpeech()
      stub.calls.length = 0

      api.toggleSpeak()

      expect(api.enableSpeak.value).toBe(false)
      expect(stub.calls.filter((c) => c.name === 'cancel')).toHaveLength(1)
      wrapper.unmount()
    })

    it('toggleSpeak で true に戻したとき cancel は呼ばれない', () => {
      const { wrapper, api } = mountUseSpeech()
      api.toggleSpeak()
      stub.calls.length = 0

      api.toggleSpeak()

      expect(api.enableSpeak.value).toBe(true)
      expect(stub.calls).toHaveLength(0)
      wrapper.unmount()
    })

    it('アンマウント時に読み上げを停止する', () => {
      const { wrapper } = mountUseSpeech()
      stub.calls.length = 0

      wrapper.unmount()

      expect(stub.calls.filter((c) => c.name === 'cancel')).toHaveLength(1)
    })
  })

  describe('Web Speech API 非対応環境', () => {
    beforeEach(() => {
      delete global.SpeechSynthesisUtterance
      delete global.speechSynthesis
    })

    it('マウントに失敗せず、読み上げは無効化される', () => {
      const { wrapper, api } = mountUseSpeech()

      expect(api.isSupported).toBe(false)
      expect(api.enableSpeak.value).toBe(false)

      // API が無い環境でも例外を投げないこと
      expect(() => api.speakText('あきのたの')).not.toThrow()
      expect(() => wrapper.unmount()).not.toThrow()
    })
  })
})

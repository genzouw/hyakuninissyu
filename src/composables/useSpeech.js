import { ref } from 'vue'

const SPEECH_PITCH = 1
const SPEECH_LANG = 'ja-JP'

// 読み上げは付加機能のため、Web Speech API 非対応環境でも
// ゲーム本体が動作するよう、利用可否を判定して以降の処理をガードする。
const isSpeechSupported = () =>
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function'

export function useSpeech () {
  const isSupported = isSpeechSupported()
  const enableSpeak = ref(isSupported)

  const cancelSpeech = () => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
  }

  const toggleSpeak = () => {
    enableSpeak.value = !enableSpeak.value
    if (!enableSpeak.value) {
      cancelSpeech()
    }
  }

  const speakText = (text) => {
    if (!isSupported) return
    if (!enableSpeak.value) return
    cancelSpeech()
    // utterance は使い捨て前提のオブジェクト。使い回すと cancel 直後の
    // 再生で end イベントが飛ばず次の発話が始まらない事象を踏むため、毎回生成する。
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.pitch = SPEECH_PITCH
    utterance.lang = SPEECH_LANG
    window.speechSynthesis.speak(utterance)
  }

  return {
    isSupported,
    enableSpeak,
    toggleSpeak,
    cancelSpeech,
    speakText,
  }
}

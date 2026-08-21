import { ref } from 'vue'

const SPEECH_PITCH = 1
const SPEECH_LANG = 'ja-JP'

export function useSpeech () {
  const enableSpeak = ref(true)

  const cancelSpeech = () => {
    window.speechSynthesis.cancel()
  }

  const toggleSpeak = () => {
    enableSpeak.value = !enableSpeak.value
    if (!enableSpeak.value) {
      cancelSpeech()
    }
  }

  const speakText = (text) => {
    if (!enableSpeak.value) return
    cancelSpeech()
    // utterance は使い捨て前提のオブジェクト。使い回すと cancel 直後の
    // 再生で end イベントが飛ばず次の発話が始まらない事象を踏むため、毎回生成する。
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.pitch = SPEECH_PITCH
    utterance.lang = SPEECH_LANG
    window.speechSynthesis.speak(utterance)
  }

  return {
    enableSpeak,
    toggleSpeak,
    cancelSpeech,
    speakText,
  }
}

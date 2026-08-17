import { ref } from 'vue'

export function useSpeech () {
  const enableSpeak = ref(true)
  const speak = new SpeechSynthesisUtterance()

  speak.pitch = 1
  speak.lang = 'ja-JP'

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
    speak.text = text
    window.speechSynthesis.speak(speak)
  }

  return {
    enableSpeak,
    toggleSpeak,
    cancelSpeech,
    speakText,
  }
}

import { ref } from 'vue'

export function useSpeech () {
  const enableSpeak = ref(true)
  const speak = new SpeechSynthesisUtterance()

  speak.pitch = 1
  speak.lang = 'ja-JP'

  const toggleSpeak = () => {
    enableSpeak.value = !enableSpeak.value
  }

  const cancelSpeech = () => {
    window.speechSynthesis.cancel()
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
    speakText
  }
}

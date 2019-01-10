const vue = new Vue({
  el: '#app',
  data: {
    currentQuestionIndex: -1,
    score: 0,
    totalQuestions: 25,
    questionData: {
      question: '',
      choices: [],
      answer: '',
    },
    choice: null,
    thinking: false,
    questionList: [],
    result: '',
  },
  mounted() {
    $('#app').show()
    this.questionList = _.shuffle(questions)
  },
  methods: {
    clickStart() {
      this.clickNext()
    },
    clickAnswer() {
      this.thinking = false

      const selectedOption = $('input[name=option]:checked')

      if (this.questionData.answer === this.choice) {
        selectedOption.closest('label').addClass('correct')
        this.score++
      } else {
        selectedOption.closest('label').addClass('incorrect')
      }
    },
    clickNext() {
      this.currentQuestionIndex++

      if (this.currentQuestionIndex < this.totalQuestions) {
        this.loadQuestion()
      } else {
        const rate = Math.round(100 * this.score / this.totalQuestions)
        this.result = `スコアは ${this.score}/${this.totalQuestions} ( ${rate}% ) です。`
      }
    },
    loadQuestion() {
      this.questionData = this.questionList[this.currentQuestionIndex]
      this.questionData.choices = _.shuffle(this.questionData.choices)
      this.thinking = true
      this.choice = null
    },
  },
})

// Twitter
window.twttr = (function (d, s, id) {
  let js; const fjs = d.getElementsByTagName(s)[0]

  const t = window.twttr || {}
  if (d.getElementById(id)) return t
  js = d.createElement(s)
  js.id = id
  js.src = 'https://platform.twitter.com/widgets.js'
  fjs.parentNode.insertBefore(js, fjs)

  t._e = []
  t.ready = function (f) {
    t._e.push(f)
  }
  return t
}(document, 'script', 'twitter-wjs'))

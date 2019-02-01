const vue = new Vue({
  el: '#app',
  data: {
    currentQuestionIndex: -1,
    score: 0,
    totalQuestions: 10,
    questionData: {
      question: '',
      choices: [],
      answer: '',
    },
    choice: null,
    thinking: false,
    questionList: [],
    result: '',
    histories: [],
  },
  mounted() {
    $('#app').show()
    this.questionList = _.shuffle(questions)
    this.histories = JSON.parse(localStorage.histories || '[]')
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
        this.result = `${this.score}/${this.totalQuestions}`

        this.histories.push({
          date: new Date(),
          score: this.score,
          total: this.totalQuestions,
        })
        localStorage.histories = JSON.stringify(this.histories)
      }
    },
    loadQuestion() {
      this.questionData = this.questionList[this.currentQuestionIndex]
      const dummies = _.shuffle(
        _.filter(
          _.map(this.questionList, (v, k) => v.answer),
          v => v != this.questionData.answer,
        ),
      )
      this.questionData.choices = [
        this.questionData.answer,
        dummies[0],
        dummies[1],
        dummies[2],
      ]
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

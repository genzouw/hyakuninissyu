$(() => {
  let currentQuestionIndex = 0
  let score = 0
  // const countOfRestQuestions = questions.length
  const totalQuestions = 3

  const quizContainer = $('#quizContainer')
  const questionQ = $('#question')
  const answerButton = $('#answerButton')
  const nextButton = $('#nextButton')

  const loadQuestion = ((index) => {
    const q = questions[index]

    questionQ.text(q.question)

    $('label.option').each((i, label) => {
      $(label)
        .removeClass('correct incorrect')
        .find('span')
        .text(q.choices[i])
        .siblings('input')[0].checked = false
    })

    answerButton.show()
    nextButton.hide()
    $('input[name=option]').prop('disabled', false)
  })

  quizContainer.hide()
  $('.start').on('click', () => {
    $('#quiz-start-page').hide()
    quizContainer.show()
    loadQuestion(currentQuestionIndex)
  })

  answerButton.on('click', () => {
    const selectedOption = $('input[name=option]:checked')
    if (selectedOption.length === 0) {
      swal({
        title: '回答を選択してください。',
        icon: 'warning',
        button: 'OK',
      })
      return
    }

    const q = questions[currentQuestionIndex]

    const selectedLabel = selectedOption.siblings('span')
    if (q.answer === selectedLabel.text()) {
      selectedOption.closest('label').addClass('correct')
      score++
    } else {
      selectedOption.closest('label').addClass('incorrect')
    }

    answerButton.hide()
    nextButton.show()
    $('input[name=option]').prop('disabled', true)
  })

  nextButton.on('click', () => {
    currentQuestionIndex++
    loadNextQuestion()
  })

  function loadNextQuestion() {
    if (currentQuestionIndex < totalQuestions) {
      loadQuestion(currentQuestionIndex)
    } else {
      const rate = Math.round(100 * score / totalQuestions)
      quizContainer.hide()
      $('#result')
        .show()
        .text(`スコアは ${score}/${totalQuestions} ( ${rate}% ) です。`)
    }
  }
})

//  < !--TWITTER WIDGET -->
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

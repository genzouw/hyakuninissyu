// DOCUMENT READY
$(() => {
  let currentQuestion = 0
  let score = 0
  // const totalQuestions = questions.length
  const totalQuestions = 3

  // ALL THE VARIABLES
  const container = $('#quizContainer')
  const questionQ = $('#question')
  const nextButton = $('#nextButton')
  let q

  // PAGE LOAD

  $('.main-container').hide()
  $('.start').on('click', () => {
    $('.quiz-start-page').hide()
    $('.main-container').show()
  })
  // CREATE A FUNCTION TO LOAD THE QUESTION
  const loadQuestion = ((index) => {
    q = questions[index]
    questionQ.text(q.question)

    for (let i = 4; i > 0; i -= 1) {
      $(`#opt${i}`)
        .text(q[`option${i}`])
        .siblings('input')[0].checked = false
    }
  })

  loadQuestion(currentQuestion)

  // CREATE A FUNCTION TO LOAD THE NEXT QUESTION
  nextButton.on('click', () => {
    currentQuestion += 1
    loadNextQuestion()
  })

  function loadNextQuestion() {
    const selectedOption = $('input[name=option]:checked')
    if (selectedOption.length === 0) {
      swal({
        title: 'Please select an answer!',
        icon: 'warning',
        button: 'OK',
      })
      return
    }

    const answer = selectedOption.siblings('span').text()
    if (q.answer === answer) {
      alert('正解！')
      score += 1
    } else {
      alert('残念。。。')
    }

    if (currentQuestion === totalQuestions) {
      let text = `Your score is ${score}! `

      if (score < 5) {
        text += 'Uh oh you need work harder!'
      } else if (score < 8) {
        text += 'Wow, that\'s impressive!'
      } else {
        text += 'You\'re a JS ninja! Want to take the intermediate level?'
      }

      container.show()
      $('#result')
        .text(text)
        .show()
    } else {
      nextButton.text('Finish')

      loadQuestion(currentQuestion)
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

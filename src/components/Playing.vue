<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h2>[だい{{ currentQuestionIndex + 1 }}もん]</h2>
      </div>
      <div class="col-auto">
        <button
          class="btn btn-sm btn-primary"
          v-bind:class="{
            'btn-primary': this.enableSpeak,
            'btn-secondary': !this.enableSpeak,
          }"
          @click.prevent="clickSpeakToggle"
        >
          {{ this.enableSpeak ? '○' : '✕' }} よみあげ{{
            this.enableSpeak ? 'あり' : 'なし'
          }}
        </button>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-sm-10 cont main-container bg-secondary text-dark">
        <p>{{ questionData.question }}</p>
        <div class="row">
          <div
            class="col-sm-12"
            v-for="(c, i) in questionData.choices"
            v-bind:key="c"
          >
            <label
              class="option"
              v-bind:class="{
                correct: !thinking && c === questionData.answer,
                choiced: !thinking && c === choice,
              }"
            >
              <input
                type="radio"
                v-model="choice"
                v-bind:value="c"
                v-bind:disabled="!thinking"
                @change.prevent="clickAnswer"
              />
              <span>({{ i + 1 }}) {{ c }}</span>
            </label>
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-sm-12">
            <button
              class="btn btn-lg btn-primary btn-block"
              v-bind:disabled="thinking"
              @click.prevent="clickNext"
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-auto text-center">
        <img
          src="@/assets/hyakunin_issyu.png"
          class="img-fluid w-75 mx-auto d-block"
          alt=""
        />
      </div>
    </div>
    <audio id="right-sound" preload>
      <source src="@/assets/right.mp3" type="audio/mp3" />
    </audio>
    <audio id="wrong-sound" preload>
      <source src="@/assets/wrong.mp3" type="audio/mp3" />
    </audio>
  </div>
</template>

<script>
import _ from 'underscore'
import poems from '@/data/poems'

export default {
  data () {
    return {
      currentQuestionIndex: 0,
      score: 0,
      countOfQuestions: 0,
      questionData: {
        question: '',
        choices: [],
        answer: ''
      },
      choice: null,
      thinking: false,
      questionList: [],
      speak: new SpeechSynthesisUtterance(),
      enableSpeak: true
    }
  },
  mounted () {
    this.speak.pitch = 1
    this.speak.lang = 'ja-JP'

    this.countOfQuestions = this.$route.params.countOfQuestions
    this.questionList = _.shuffle(poems)
    this.loadQuestion()
  },
  methods: {
    clickStart () {
      this.clickNext()
    },
    clickAnswer () {
      this.thinking = false

      if (this.enableSpeak) {
        speechSynthesis.cancel(this.speak)
        this.speak.text = this.questionData.answer
        speechSynthesis.speak(this.speak)
      }

      // 正解したら
      if (this.questionData.answer === this.choice) {
        this.score++
        this.$store.dispatch(
          'collection/addCollectedPoem',
          this.questionData.id
        )

        const rightSound = document.getElementById('right-sound')
        rightSound.play()
      } else {
        const wrongSound = document.getElementById('wrong-sound')
        wrongSound.play()
      }
    },
    clickNext () {
      this.currentQuestionIndex++

      if (this.currentQuestionIndex < this.countOfQuestions) {
        this.loadQuestion()
      } else {
        this.$router.push(`/gameSet/${this.countOfQuestions}/${this.score}`)
      }
    },
    loadQuestion () {
      this.questionData = { ...this.questionList[this.currentQuestionIndex] }
      const dummyAnswers = this.questionList.reduce((acc, v) => {
        if (v.answer !== this.questionData.answer) {
          acc.push(v.answer)
        }
        return acc
      }, [])
      const dummies = _.shuffle(dummyAnswers)

      this.questionData.choices = [
        this.questionData.answer,
        dummies[0],
        dummies[1],
        dummies[2]
      ]
      this.questionData.choices = _.shuffle(this.questionData.choices)
      this.thinking = true
      this.choice = null

      this.speakQuestionIfEnabled()
    },
    clickSpeakToggle () {
      this.enableSpeak = !this.enableSpeak

      this.speakQuestionIfEnabled()
    },
    speakQuestionIfEnabled () {
      if (this.enableSpeak) {
        speechSynthesis.cancel(this.speak)
        this.speak.text = this.questionData.question
        speechSynthesis.speak(this.speak)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#navbarSupportedContent h1 {
  font-size: 100%;
}

.quiz-start-page {
  text-align: center;
  /* background: linear-gradient(to bottom right, #f7ff9194, #f7ff91b8); */
}

.option {
  width: 95%;
  padding: 10px 0 10px 10px;
  background: #e2e2e2;
  margin: 10px 0 10px 10px;
  color: #000000;
  border-radius: 20px;
  margin-bottom: 0.25em;
}

.choiced {
  background-color: pink;
}

.choiced:after {
  content: ' ×';
  color: red;
  font-weight: bold;
}

.correct {
  background-color: lightblue;
  color: darkblue;
}

.correct.choiced {
  background-color: lightgreen;
}

.correct.choiced:after {
  content: ' ○';
  color: blue;
  font-weight: bold;
}
</style>

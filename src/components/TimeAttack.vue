<template>
  <div>
    <div class="row mb-3">
      <div class="col-md-6">
        <div class="card bg-primary text-white">
          <div class="card-body text-center">
            <h5 class="card-title">経過時間</h5>
            <h2 class="display-4">{{ formattedTime }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card bg-success text-white">
          <div class="card-body text-center">
            <h5 class="card-title">残り枚数</h5>
            <h2 class="display-4">{{ remainingCards }}</h2>
          </div>
        </div>
      </div>
    </div>

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
          class="img-fluid w-75 center-block"
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
import { mapGetters, mapActions } from 'vuex'
import poems from '@/data/poems'

export default {
  data () {
    return {
      currentQuestionIndex: 0,
      score: 0,
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
  computed: {
    ...mapGetters('timeAttack', [
      'formattedTime',
      'isGameFinished',
      'elapsedTimeMs'
    ]),
    remainingCards () {
      return this.$store.state.timeAttack.remainingCards
    }
  },
  mounted () {
    this.speak.pitch = 1
    this.speak.lang = 'ja-JP'

    // 全100首をシャッフルして使用
    this.questionList = _.shuffle(poems)

    // ゲーム開始
    this.startGame()
    this.loadQuestion()
  },
  beforeUnmount () {
    // コンポーネント破棄時にタイマーを停止
    this.stopGame()
  },
  methods: {
    ...mapActions('timeAttack', ['startGame', 'answerCard', 'stopGame']),
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

      // 枚数を減らす
      this.answerCard()
    },
    clickNext () {
      this.currentQuestionIndex++

      // 全100首クリアしたら結果画面へ
      if (this.currentQuestionIndex < this.questionList.length) {
        this.loadQuestion()
      } else {
        this.stopGame()
        this.$router.push(
          `/time-attack-result/${this.elapsedTimeMs}/${this.score}`
        )
      }
    },
    loadQuestion () {
      this.questionData = { ...this.questionList[this.currentQuestionIndex] }
      const dummies = _.shuffle(
        _.filter(
          _.map(this.questionList, (v, k) => {
            return v.answer
          }),
          (v) => {
            return v !== this.questionData.answer
          }
        )
      )
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

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.display-4 {
  font-weight: bold;
}
</style>

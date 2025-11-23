<template>
  <div class="container mt-5">
    <!-- ゲーム開始前の設定画面 -->
    <div v-if="!gameStarted" class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-danger text-white text-center">
            <h2>🤖 AI対戦モード</h2>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="h5">問題数を選択</label>
              <div class="btn-group btn-group-lg d-flex" role="group">
                <button
                  v-for="count in [10, 20, 30]"
                  :key="count"
                  type="button"
                  class="btn"
                  :class="selectedQuestionCount === count ? 'btn-primary' : 'btn-outline-primary'"
                  @click="selectedQuestionCount = count"
                >
                  {{ count }}問
                </button>
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="h5">難易度を選択</label>
              <div class="btn-group btn-group-lg d-flex" role="group">
                <button
                  type="button"
                  class="btn"
                  :class="difficulty === 'easy' ? 'btn-success' : 'btn-outline-success'"
                  @click="difficulty = 'easy'"
                >
                  やさしい
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="difficulty === 'normal' ? 'btn-warning' : 'btn-outline-warning'"
                  @click="difficulty = 'normal'"
                >
                  ふつう
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="difficulty === 'hard' ? 'btn-danger' : 'btn-outline-danger'"
                  @click="difficulty = 'hard'"
                >
                  むずかしい
                </button>
              </div>
              <small class="form-text text-muted mt-2">
                やさしい: AIの正答率 約60% / ふつう: AIの正答率 約75% / むずかしい: AIの正答率 約90%
              </small>
            </div>

            <div class="text-center mt-4">
              <button @click="startGame" class="btn btn-lg btn-primary pl-5 pr-5">
                対戦開始！
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ゲーム中の画面 -->
    <div v-else-if="!gameFinished" class="row justify-content-center">
      <div class="col-md-10">
        <!-- スコア表示 -->
        <div class="row mb-3">
          <div class="col-6">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <h5>👤 あなた</h5>
                <h2>{{ playerScore }} / {{ currentQuestionIndex }}</h2>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="card bg-danger text-white">
              <div class="card-body text-center">
                <h5>🤖 AI</h5>
                <h2>{{ aiScore }} / {{ currentQuestionIndex }}</h2>
              </div>
            </div>
          </div>
        </div>

        <!-- 問題表示 -->
        <div class="card">
          <div class="card-header text-center">
            <h4>問題 {{ currentQuestionIndex + 1 }} / {{ selectedQuestionCount }}</h4>
          </div>
          <div class="card-body">
            <div class="text-center mb-4">
              <h3 class="question-text">{{ currentQuestion.question }}</h3>
            </div>

            <!-- 回答中の状態 -->
            <div v-if="!playerAnswered">
              <div class="row">
                <div
                  v-for="(choice, index) in choices"
                  :key="index"
                  class="col-md-6 mb-3"
                >
                  <button
                    @click="selectAnswer(index)"
                    class="btn btn-outline-primary btn-lg btn-block choice-btn"
                    :disabled="waitingForAI"
                  >
                    {{ choice }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 回答後の結果表示 -->
            <div v-else>
              <div class="row">
                <div
                  v-for="(choice, index) in choices"
                  :key="index"
                  class="col-md-6 mb-3"
                >
                  <button
                    class="btn btn-lg btn-block choice-btn"
                    :class="{
                      'btn-success': index === correctAnswerIndex,
                      'btn-danger': index === playerAnswerIndex && index !== correctAnswerIndex,
                      'btn-outline-secondary': index !== playerAnswerIndex && index !== correctAnswerIndex && index !== aiAnswerIndex,
                      'btn-warning': index === aiAnswerIndex && index !== correctAnswerIndex
                    }"
                    disabled
                  >
                    {{ choice }}
                    <span v-if="index === playerAnswerIndex">（あなた）</span>
                    <span v-if="index === aiAnswerIndex">（AI）</span>
                  </button>
                </div>
              </div>

              <div class="text-center mt-4">
                <div v-if="playerCorrect" class="alert alert-success">
                  <strong>✅ 正解！</strong>
                </div>
                <div v-else class="alert alert-danger">
                  <strong>❌ 不正解</strong> 正解: {{ currentQuestion.answer }}
                </div>

                <div v-if="aiAnswered">
                  <div v-if="aiCorrect" class="alert alert-warning">
                    🤖 AIも正解しました
                  </div>
                  <div v-else class="alert alert-info">
                    🤖 AIは不正解でした
                  </div>
                </div>
                <div v-else class="alert alert-secondary">
                  🤖 AIが考え中...
                </div>

                <button
                  @click="nextQuestion"
                  class="btn btn-primary btn-lg mt-3"
                  :disabled="!aiAnswered"
                >
                  次の問題へ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'underscore'

export default {
  data () {
    return {
      // ゲーム設定
      gameStarted: false,
      gameFinished: false,
      selectedQuestionCount: 10,
      difficulty: 'normal',

      // 問題データ
      questions: [],
      currentQuestionIndex: 0,
      currentQuestion: {},
      choices: [],
      correctAnswerIndex: -1,

      // プレイヤーの状態
      playerScore: 0,
      playerAnswered: false,
      playerAnswerIndex: -1,
      playerCorrect: false,

      // AIの状態
      aiScore: 0,
      aiAnswered: false,
      aiAnswerIndex: -1,
      aiCorrect: false,
      waitingForAI: false
    }
  },
  computed: {
    aiAccuracy () {
      const accuracyMap = {
        easy: 0.6,
        normal: 0.75,
        hard: 0.9
      }
      return accuracyMap[this.difficulty] || 0.75
    },
    aiDelayRange () {
      const delayMap = {
        easy: { min: 2000, max: 4000 },
        normal: { min: 1000, max: 3000 },
        hard: { min: 500, max: 2000 }
      }
      return delayMap[this.difficulty] || { min: 1000, max: 3000 }
    }
  },
  methods: {
    startGame () {
      this.gameStarted = true
      this.loadQuestions()
      this.loadQuestion()
    },
    loadQuestions () {
      // 全100首からランダムに必要な問題数を選択
      const allQuestions = this.$store.state.questions
      this.questions = _.sample(allQuestions, this.selectedQuestionCount)
    },
    loadQuestion () {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.finishGame()
        return
      }

      this.currentQuestion = this.questions[this.currentQuestionIndex]

      // 選択肢を生成（正解 + ダミー3つ）
      const dummyAnswers = this.$store.state.questions
        .filter(q => q.answer !== this.currentQuestion.answer)
        .map(q => q.answer)

      const selectedDummyAnswers = _.sample(dummyAnswers, 3)
      const allChoices = [this.currentQuestion.answer, ...selectedDummyAnswers]
      this.choices = _.shuffle(allChoices)

      // 正解のインデックスを保存
      this.correctAnswerIndex = this.choices.indexOf(this.currentQuestion.answer)

      // 状態をリセット
      this.playerAnswered = false
      this.playerAnswerIndex = -1
      this.playerCorrect = false
      this.aiAnswered = false
      this.aiAnswerIndex = -1
      this.aiCorrect = false
      this.waitingForAI = false
    },
    selectAnswer (index) {
      this.playerAnswerIndex = index
      this.playerCorrect = index === this.correctAnswerIndex
      this.playerAnswered = true

      if (this.playerCorrect) {
        this.playerScore++
      }

      // AIの回答を開始
      this.simulateAIAnswer()
    },
    simulateAIAnswer () {
      this.waitingForAI = true

      // AIの思考時間（ランダム遅延）
      const delay = Math.random() * (this.aiDelayRange.max - this.aiDelayRange.min) + this.aiDelayRange.min

      setTimeout(() => {
        // AIが正解するかどうかを判定
        const willAnswerCorrectly = Math.random() < this.aiAccuracy

        if (willAnswerCorrectly) {
          // 正解を選択
          this.aiAnswerIndex = this.correctAnswerIndex
          this.aiCorrect = true
          this.aiScore++
        } else {
          // 不正解をランダムに選択
          const incorrectChoices = [0, 1, 2, 3].filter(i => i !== this.correctAnswerIndex)
          this.aiAnswerIndex = _.sample(incorrectChoices)
          this.aiCorrect = false
        }

        this.aiAnswered = true
        this.waitingForAI = false
      }, delay)
    },
    nextQuestion () {
      this.currentQuestionIndex++
      this.loadQuestion()
    },
    finishGame () {
      this.gameFinished = true
      // 結果画面に遷移
      this.$router.push({
        path: `/ai-battle-result/${this.playerScore}/${this.aiScore}/${this.selectedQuestionCount}/${this.difficulty}`
      })
    }
  }
}
</script>

<style scoped>
.question-text {
  font-size: 1.5rem;
  line-height: 1.8;
  color: #333;
}

.choice-btn {
  min-height: 80px;
  font-size: 1.1rem;
  white-space: normal;
  word-wrap: break-word;
}

.card-header h2,
.card-header h4 {
  margin: 0;
}
</style>

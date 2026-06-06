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
            <div class="mb-3">
              <label class="h5">問題数を選択</label>
              <div class="btn-group btn-group-lg d-flex" role="group">
                <button
                  v-for="count in [10, 20, 30]"
                  :key="count"
                  type="button"
                  class="btn"
                  :class="
                    selectedQuestionCount === count
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  "
                  @click="selectedQuestionCount = count"
                >
                  {{ count }}問
                </button>
              </div>
            </div>

            <div class="mb-3 mt-4">
              <label class="h5">難易度を選択</label>
              <div class="btn-group btn-group-lg d-flex" role="group">
                <button
                  type="button"
                  class="btn"
                  :class="
                    difficulty === 'easy'
                      ? 'btn-success'
                      : 'btn-outline-success'
                  "
                  @click="difficulty = 'easy'"
                >
                  やさしい
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="
                    difficulty === 'normal'
                      ? 'btn-warning'
                      : 'btn-outline-warning'
                  "
                  @click="difficulty = 'normal'"
                >
                  ふつう
                </button>
                <button
                  type="button"
                  class="btn"
                  :class="
                    difficulty === 'hard' ? 'btn-danger' : 'btn-outline-danger'
                  "
                  @click="difficulty = 'hard'"
                >
                  むずかしい
                </button>
              </div>
              <small class="form-text text-muted mt-2">
                やさしい: AIの正答率 約60% / ふつう: AIの正答率 約75% /
                むずかしい: AIの正答率 約90%
              </small>
            </div>

            <div class="text-center mt-4">
              <button
                @click="startGame"
                class="btn btn-lg btn-primary ps-5 pe-5"
              >
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
        <!-- 音声読み上げトグル -->
        <div class="row mb-3">
          <div class="col-12 text-end">
            <button
              @click="clickSpeakToggle"
              class="btn btn-sm"
              :class="enableSpeak ? 'btn-success' : 'btn-outline-secondary'"
            >
              <span v-if="enableSpeak">🔊 読み上げ ON</span>
              <span v-else>🔇 読み上げ OFF</span>
            </button>
          </div>
        </div>

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
                <div v-if="aiWrong" class="mt-2 badge badge-warning text-dark">
                  お手つき！
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 問題表示 -->
        <div class="card">
          <div class="card-header text-center">
            <h4>
              問題 {{ currentQuestionIndex + 1 }} / {{ selectedQuestionCount }}
            </h4>
          </div>
          <div class="card-body">
            <!-- 上の句（カウントダウン終了後のみ表示） -->
            <div v-if="countdown <= 0" class="text-center mb-4">
              <h3 class="question-text">{{ currentQuestion.question }}</h3>
            </div>

            <!-- 回答中の状態 -->
            <div v-if="!roundFinished">
              <!-- カウントダウン表示（選択肢の上部） -->
              <div v-if="countdown > 0" class="text-center mb-4">
                <h1 class="countdown-number text-primary">{{ countdown }}</h1>
                <p class="text-muted">下の句を確認してください</p>
              </div>

              <!-- 選択肢（カウントダウン中も常に表示） -->
              <div class="row">
                <div
                  v-for="(choice, index) in choices"
                  :key="index"
                  class="col-md-6 mb-3"
                >
                  <button
                    @click="selectAnswer(index)"
                    class="btn btn-outline-primary btn-lg btn-block choice-btn"
                    :disabled="!canAnswer"
                  >
                    {{ choice }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 回答後の結果表示（早押し式：正解が出たら即座に次へ） -->
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
                      'btn-outline-secondary': index !== correctAnswerIndex,
                    }"
                    disabled
                  >
                    {{ choice }}
                    <span v-if="index === winnerAnswerIndex"
                      >（{{ winner === 'player' ? 'あなた' : 'AI' }}）</span
                    >
                  </button>
                </div>
              </div>

              <div class="text-center mt-4">
                <div v-if="winner === 'player'" class="alert alert-success">
                  <strong>✅ あなたが先に正解！</strong>
                </div>
                <div v-else-if="winner === 'ai'" class="alert alert-warning">
                  <strong>🤖 AIが先に正解！</strong>
                </div>
                <div v-else class="alert alert-info">
                  <strong>😢 どちらも不正解...</strong>
                </div>

                <p class="text-muted mt-2">{{ transitionMessage }}</p>
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
import poems from '@/data/poems'

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
      playerAnswerTime: null,

      // AIの状態
      aiScore: 0,
      aiAnswerTime: null,
      aiWrong: false,

      // ラウンド状態（早押し式）
      roundFinished: false,
      winner: null, // 'player', 'ai', null（どちらも不正解）
      winnerAnswerIndex: -1,
      transitionMessage: '',
      aiTimeout: null,
      currentRoundId: 0, // 各問題に一意のIDを割り当てて競合を防ぐ

      // 音声読み上げ
      speak: new SpeechSynthesisUtterance(),
      enableSpeak: true,

      // カウントダウン
      countdown: 0,
      countdownInterval: null,
      canAnswer: false, // プレイヤーが回答可能かどうか
    }
  },
  mounted () {
    this.speak.pitch = 1
    this.speak.lang = 'ja-JP'
  },
  computed: {
    aiAccuracy () {
      const accuracyMap = {
        easy: 0.5, // 50% - 弱い
        normal: 0.75, // 75% - 普通
        hard: 0.95, // 95% - 強い
      }
      return accuracyMap[this.difficulty] || 0.75
    },
    aiDelayRange () {
      const delayMap = {
        easy: { min: 4500, max: 7500 }, // 遅い（4.5〜7.5秒）
        normal: { min: 2250, max: 4500 }, // 普通（2.25〜4.5秒）
        hard: { min: 750, max: 2250 }, // 速い（0.75〜2.25秒）
      }
      return delayMap[this.difficulty] || { min: 2250, max: 4500 }
    },
  },
  methods: {
    startGame () {
      this.gameStarted = true
      this.loadQuestions()
      this.loadQuestion()
    },
    loadQuestions () {
      // 全100首からランダムに必要な問題数を選択
      this.questions = _.sample(poems, this.selectedQuestionCount)
    },
    loadQuestion () {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.finishGame()
        return
      }

      this.currentQuestion = this.questions[this.currentQuestionIndex]

      // 選択肢を生成（正解 + ダミー3つ）
      const dummyAnswers = poems
        .filter((q) => q.answer !== this.currentQuestion.answer)
        .map((q) => q.answer)

      const selectedDummyAnswers = _.sample(dummyAnswers, 3)
      const allChoices = [this.currentQuestion.answer, ...selectedDummyAnswers]
      this.choices = _.shuffle(allChoices)

      // 正解のインデックスを保存
      this.correctAnswerIndex = this.choices.indexOf(
        this.currentQuestion.answer
      )

      // 早押し式：状態をリセット
      this.roundFinished = false
      this.winner = null
      this.winnerAnswerIndex = -1
      this.transitionMessage = ''
      this.playerAnswerTime = null
      this.aiAnswerTime = null
      this.aiWrong = false
      this.canAnswer = false // カウントダウン中は回答不可

      // 新しいラウンドIDを生成して、古いAIタイマーのコールバックを無効化
      this.currentRoundId++

      // AIのタイマーをクリア（前の問題のタイマーが残っている場合）
      if (this.aiTimeout) {
        clearTimeout(this.aiTimeout)
        this.aiTimeout = null
      }

      // カウントダウンタイマーをクリア（前の問題のタイマーが残っている場合）
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }

      // 3秒カウントダウンを開始
      this.countdown = 3
      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownInterval)
          this.countdownInterval = null

          // カウントダウン終了後の処理順序：
          // 1. 音声読み上げ
          // 2. AIタイマー開始（重要：プレイヤーの回答許可より先に開始）
          // 3. プレイヤーの回答許可
          this.speakQuestionIfEnabled()

          // AIタイマーを開始（currentRoundIdをキャプチャ）
          this.simulateAIAnswer()

          // プレイヤーの回答を許可
          // AIタイマーが確実に設定された後に許可することで競合状態を回避
          this.$nextTick(() => {
            this.canAnswer = true
          })
        }
      }, 1000)
    },
    selectAnswer (index) {
      // 回答不可の場合（カウントダウン中など）は何もしない
      if (!this.canAnswer || this.roundFinished) {
        return
      }

      // プレイヤーの回答時刻を記録
      this.playerAnswerTime = Date.now()

      // 正解かどうか判定
      const isCorrect = index === this.correctAnswerIndex

      if (isCorrect) {
        // プレイヤーが正解 → 即座にラウンド終了
        this.roundFinished = true
        this.winner = 'player'
        this.winnerAnswerIndex = index
        this.playerScore++
        this.$store.dispatch(
          'collection/addCollectedPoem',
          this.currentQuestion.id
        )

        // 正解の下の句を読み上げ
        this.speakAnswer()

        // AIのタイマーをキャンセル
        if (this.aiTimeout) {
          clearTimeout(this.aiTimeout)
          this.aiTimeout = null
        }

        // 2秒後に次の問題へ自動遷移
        this.transitionMessage = '2秒後に次の問題へ進みます...'
        setTimeout(() => {
          this.nextQuestion()
        }, 2000)
      } else {
        // プレイヤーが不正解 → AIの結果を待つ
        // AIがまだ答えていない場合は何もせず、AIのタイマーが発火するのを待つ
        // AIが既に答えている場合は、AIが正解していれば勝ち、そうでなければ引き分け
        if (this.aiAnswerTime !== null) {
          this.checkResult()
        }
      }
    },
    simulateAIAnswer () {
      // AIの思考時間（ランダム遅延）
      const delay =
        this.getSecureRandom() *
          (this.aiDelayRange.max - this.aiDelayRange.min) +
        this.aiDelayRange.min

      // 【競合状態対策】現在のラウンドIDをキャプチャ
      // このパターンにより、古いタイマーのコールバックを安全に無効化できる
      // 理由: clearTimeoutだけでは既にスケジュールされたコールバックの実行を完全には防げないため
      const roundIdAtStart = this.currentRoundId

      this.aiTimeout = setTimeout(() => {
        // 【競合状態チェック1】ラウンドIDの検証
        // ラウンドIDが変わっている = 既に次の問題に移行している
        // → この古いタイマーのコールバックをスキップ
        if (this.currentRoundId !== roundIdAtStart) {
          return
        }

        // 【競合状態チェック2】ラウンド終了状態の検証
        // プレイヤーが先に正解してラウンドが終了している場合はスキップ
        if (this.roundFinished) {
          return
        }

        // AIの回答時刻を記録
        this.aiAnswerTime = Date.now()

        // AIが正解するかどうかを判定
        const willAnswerCorrectly = this.getSecureRandom() < this.aiAccuracy

        if (willAnswerCorrectly) {
          // AIが正解 → 即座にラウンド終了
          this.roundFinished = true
          this.winner = 'ai'
          this.winnerAnswerIndex = this.correctAnswerIndex
          this.aiScore++

          // 正解の下の句を読み上げ
          this.speakAnswer()

          // 2秒後に次の問題へ自動遷移
          this.transitionMessage = '2秒後に次の問題へ進みます...'
          setTimeout(() => {
            this.nextQuestion()
          }, 2000)
        } else {
          // AIが不正解 → プレイヤーの結果を確認
          // 「お手つき！」バッジを表示してユーザーに視覚的フィードバックを提供
          this.aiWrong = true
          this.checkResult()
        }
      }, delay)
    },
    checkResult () {
      // プレイヤーとAIの両方が回答済みで、どちらも正解していない場合は引き分け
      if (this.playerAnswerTime !== null && this.aiAnswerTime !== null) {
        this.roundFinished = true
        this.winner = null
        this.winnerAnswerIndex = -1

        // 2秒後に次の問題へ自動遷移
        this.transitionMessage = '2秒後に次の問題へ進みます...'
        setTimeout(() => {
          this.nextQuestion()
        }, 2000)
      }
    },
    nextQuestion () {
      this.currentQuestionIndex++
      this.loadQuestion()
    },
    speakQuestionIfEnabled () {
      if (this.enableSpeak) {
        speechSynthesis.cancel(this.speak)
        this.speak.text = this.currentQuestion.question
        speechSynthesis.speak(this.speak)
      }
    },
    speakAnswer () {
      if (this.enableSpeak) {
        speechSynthesis.cancel(this.speak)
        this.speak.text = this.currentQuestion.answer
        speechSynthesis.speak(this.speak)
      }
    },
    getSecureRandom () {
      const cryptoObj = window.crypto || window.msCrypto
      if (cryptoObj?.getRandomValues) {
        const array = new Uint32Array(1)
        cryptoObj.getRandomValues(array)
        return array[0] / (0xffffffff + 1)
      }
      // CSPRNG が利用できない環境向けのフォールバック (古いブラウザやテスト環境での実行時エラーを防ぐ)
      return Math.random()
    },
    clickSpeakToggle () {
      this.enableSpeak = !this.enableSpeak
      this.speakQuestionIfEnabled()
    },
    finishGame () {
      this.gameFinished = true
      // 結果画面に遷移
      this.$router.push({
        path: `/ai-battle-result/${this.playerScore}/${this.aiScore}/${this.selectedQuestionCount}/${this.difficulty}`,
      })
    },
  },
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

.countdown-number {
  font-size: 3rem;
  font-weight: bold;
  animation: pulse 1s infinite;
  margin: 0;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}
</style>

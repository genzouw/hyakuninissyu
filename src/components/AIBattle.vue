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
        <!-- 音声読み上げトグル -->
        <div class="row mb-3">
          <div class="col-12 text-right">
            <button @click="clickSpeakToggle" class="btn btn-sm" :class="enableSpeak ? 'btn-success' : 'btn-outline-secondary'">
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
                      'btn-outline-secondary': index !== correctAnswerIndex
                    }"
                    disabled
                  >
                    {{ choice }}
                    <span v-if="index === winnerAnswerIndex">（{{ winner === 'player' ? 'あなた' : 'AI' }}）</span>
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

      // ラウンド状態（早押し式）
      roundFinished: false,
      winner: null, // 'player', 'ai', null（どちらも不正解）
      winnerAnswerIndex: -1,
      transitionMessage: '',
      aiTimeout: null,

      // 音声読み上げ
      speak: new SpeechSynthesisUtterance(),
      enableSpeak: true,

      // カウントダウン
      countdown: 0,
      countdownInterval: null,
      canAnswer: false // プレイヤーが回答可能かどうか
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
        hard: 0.95 // 95% - 強い
      }
      return accuracyMap[this.difficulty] || 0.75
    },
    aiDelayRange () {
      const delayMap = {
        easy: { min: 4500, max: 7500 }, // 遅い（4.5〜7.5秒）
        normal: { min: 2250, max: 4500 }, // 普通（2.25〜4.5秒）
        hard: { min: 750, max: 2250 } // 速い（0.75〜2.25秒）
      }
      return delayMap[this.difficulty] || { min: 2250, max: 4500 }
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
      this.questions = _.sample(questions, this.selectedQuestionCount)
    },
    loadQuestion () {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.finishGame()
        return
      }

      this.currentQuestion = this.questions[this.currentQuestionIndex]

      // 選択肢を生成（正解 + ダミー3つ）
      const dummyAnswers = questions
        .filter(q => q.answer !== this.currentQuestion.answer)
        .map(q => q.answer)

      const selectedDummyAnswers = _.sample(dummyAnswers, 3)
      const allChoices = [this.currentQuestion.answer, ...selectedDummyAnswers]
      this.choices = _.shuffle(allChoices)

      // 正解のインデックスを保存
      this.correctAnswerIndex = this.choices.indexOf(this.currentQuestion.answer)

      // 早押し式：状態をリセット
      this.roundFinished = false
      this.winner = null
      this.winnerAnswerIndex = -1
      this.transitionMessage = ''
      this.playerAnswerTime = null
      this.aiAnswerTime = null
      this.canAnswer = false // カウントダウン中は回答不可

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

          // カウントダウン終了後、音声読み上げとAIタイマーを開始
          this.speakQuestionIfEnabled()
          this.simulateAIAnswer()

          // AIタイマーが確実に開始された後、プレイヤーの回答を許可
          // 100msの遅延を入れることで競合状態を回避
          setTimeout(() => {
            this.canAnswer = true
          }, 100)
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
      const delay = Math.random() * (this.aiDelayRange.max - this.aiDelayRange.min) + this.aiDelayRange.min

      this.aiTimeout = setTimeout(() => {
        // 既にラウンドが終了している場合（プレイヤーが先に正解した場合）は何もしない
        if (this.roundFinished) {
          return
        }

        // AIの回答時刻を記録
        this.aiAnswerTime = Date.now()

        // AIが正解するかどうかを判定
        const willAnswerCorrectly = Math.random() < this.aiAccuracy

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
    clickSpeakToggle () {
      this.enableSpeak = !this.enableSpeak
      this.speakQuestionIfEnabled()
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

const questions = [
  {
    question: 'あきのたの　かりほのいほの　とまをあらみ',
    answer: 'わがころもでは　つゆにぬれつつ'
  },
  {
    question: 'はるすぎて　なつきにけらし　しろたへの',
    answer: 'ころもほすてふ　あまのかぐやま'
  },
  {
    question: 'あしびきの　やまどりのをの　しだりをの',
    answer: 'ながながしよを　ひとりかもねむ'
  },
  {
    question: 'たごのうらに　うちいでてみれば　しろたへの',
    answer: 'ふじのたかねに　ゆきはふりつつ'
  },
  {
    question: 'おくやまに　もみぢふみわけ　なくしかの',
    answer: 'こゑきくときぞ　あきはかなしき'
  },
  {
    question: 'かささぎの　わたせるはしに　おくしもの',
    answer: 'しろきをみれば　よぞふけにける'
  },
  {
    question: 'あまのはら　ふりさけみれば　かすがなる',
    answer: 'みかさのやまに　いでしつきかも'
  },
  {
    question: 'わがいほは　みやこのたつみ　しかぞすむ',
    answer: 'よをうぢやまと　ひとはいふなり'
  },
  {
    question: 'はなのいろは　うつりにけりな　いたづらに',
    answer: 'わがみよにふる　ながめせしまに'
  },
  {
    question: 'これやこの　ゆくもかへるも　わかれては',
    answer: 'しるもしらぬも　あふさかのせき'
  },
  {
    question: 'わたのはら　やそしまかけて　こぎいでぬと',
    answer: 'ひとにはつげよ　あまのつりぶね'
  },
  {
    question: 'あまつかぜ　くものかよひぢ　ふきとぢよ',
    answer: 'をとめのすがた　しばしとどめむ'
  },
  {
    question: 'つくばねの　みねよりおつる　みなのがは',
    answer: 'こひぞつもりて　ふちとなりぬる'
  },
  {
    question: 'みちのくの　しのぶもぢずり　たれゆゑに',
    answer: 'みだれそめにし　われならなくに'
  },
  {
    question: 'きみがため　はるののにいでて　わかなつむ',
    answer: 'わがころもでに　ゆきはふりつつ'
  },
  {
    question: 'たちわかれ　いなばのやまの　みねにおふる',
    answer: 'まつとしきかば　いまかへりこむ'
  },
  {
    question: 'ちはやぶる　かみよもきかず　たつたがは',
    answer: 'からくれなゐに　みづくくるとは'
  },
  {
    question: 'すみのえの　きしによるなみ　よるさへや',
    answer: 'ゆめのかよひぢ　ひとめよくらむ'
  },
  {
    question: 'なにはがた　みじかきあしの　ふしのまも',
    answer: 'あはでこのよを　すぐしてよとや'
  },
  {
    question: 'わびぬれば　いまはたおなじ　なにはなる',
    answer: 'みをつくしても　あはむとぞおもふ'
  },
  {
    question: 'いまこむと　いひしばかりに　ながつきの',
    answer: 'ありあけのつきを　まちいでつるかな'
  },
  {
    question: 'ふくからに　あきのくさきの　しをるれば',
    answer: 'むべやまかぜを　あらしといふらむ'
  },
  {
    question: 'つきみれば　ちぢにものこそ　かなしけれ',
    answer: 'わがみひとつの　あきにはあらねど'
  },
  {
    question: 'このたびは　ぬさもとりあへず　たむけやま',
    answer: 'もみぢのにしき　かみのまにまに'
  },
  {
    question: 'なにしおはば　あふさかやまの　さねかづら',
    answer: 'ひとにしられで　くるよしもがな'
  },
  {
    question: 'をぐらやま　みねのもみぢば　こころあらば',
    answer: 'いまひとたびの　みゆきまたなむ'
  },
  {
    question: 'みかのはら　わきてながるる　いづみがは',
    answer: 'いつみきとてか　こひしかるらむ'
  },
  {
    question: 'やまざとは　ふゆぞさびしさ　まさりける',
    answer: 'ひとめもくさも　かれぬとおもへば'
  },
  {
    question: 'こころあてに　をらばやをらむ　はつしもの',
    answer: 'おきまどはせる　しらぎくのはな'
  },
  {
    question: 'ありあけの　つれなくみえし　わかれより',
    answer: 'あかつきばかり　うきものはなし'
  },
  {
    question: 'あさぼらけ　ありあけのつきと　みるまでに',
    answer: 'よしののさとに　ふれるしらゆき'
  },
  {
    question: 'やまがはに　かぜのかけたる　しがらみは',
    answer: 'ながれもあへぬ　もみぢなりけり'
  },
  {
    question: 'ひさかたの　ひかりのどけき　はるのひに',
    answer: 'しづごころなく　はなのちるらむ'
  },
  {
    question: 'たれをかも　しるひとにせむ　たかさごの',
    answer: 'まつもむかしの　ともならなくに'
  },
  {
    question: 'ひとはいさ　こころもしらず　ふるさとは',
    answer: 'はなぞむかしの　かににほひける'
  },
  {
    question: 'なつのよは　まだよひながら　あけぬるを',
    answer: 'くものいづこに　つきやどるらむ'
  },
  {
    question: 'しらつゆに　かぜのふきしく　あきののは',
    answer: 'つらぬきとめぬ　たまぞちりける'
  },
  {
    question: 'わすらるる　みをばおもはず　ちかひてし',
    answer: 'ひとのいのちの　をしくもあるかな'
  },
  {
    question: 'あさぢふの　をののしのはら　しのぶれど',
    answer: 'あまりてなどか　ひとのこひしき'
  },
  {
    question: 'しのぶれど　いろにいでにけり　わがこひは',
    answer: 'ものやおもふと　ひとのとふまで'
  },
  {
    question: 'こひすてふ　わがなはまだき　たちにけり',
    answer: 'ひとしれずこそ　おもひそめしか'
  },
  {
    question: 'ちぎりきな　かたみにそでを　しぼりつつ',
    answer: 'すゑのまつやま　なみこさじとは'
  },
  {
    question: 'あひみての　のちのこころに　くらぶれば',
    answer: 'むかしはものを　おもはざりけり'
  },
  {
    question: 'あふことの　たえてしなくは　なかなかに',
    answer: 'ひとをもみをも　うらみざらまし'
  },
  {
    question: 'あはれとも　いふべきひとは　おもほえで',
    answer: 'みのいたづらに　なりぬべきかな'
  },
  {
    question: 'ゆらのとを　わたるふなびと　かぢをたえ',
    answer: 'ゆくへもしらぬ　こひのみちかな'
  },
  {
    question: 'やへむぐら　しげれるやどの　さびしきに',
    answer: 'ひとこそみえね　あきはきにけり'
  },
  {
    question: 'かぜをいたみ　いはうつなみの　おのれのみ',
    answer: 'くだけてものを　おもふころかな'
  },
  {
    question: 'みかきもり　ゑじのたくひの　よるはもえ',
    answer: 'ひるはきえつつ　ものをこそおもへ'
  },
  {
    question: 'きみがため　をしからざりし　いのちさへ',
    answer: 'ながくもがなと　おもひけるかな'
  },
  {
    question: 'かくとだに　えやはいぶきの　さしもぐさ',
    answer: 'さしもしらじな　もゆるおもひを'
  },
  {
    question: 'あけぬれば　くるるものとは　しりながら',
    answer: 'なほうらめしき　あさぼらけかな'
  },
  {
    question: 'なげきつつ　ひとりぬるよの　あくるまは',
    answer: 'いかにひさしき　ものとかはしる'
  },
  {
    question: 'わすれじの　ゆくすゑまでは　かたければ',
    answer: 'けふをかぎりの　いのちともがな'
  },
  {
    question: 'たきのおとは　たえてひさしく　なりぬれど',
    answer: 'なこそながれて　なほきこえけれ'
  },
  {
    question: 'あらざらむ　このよのほかの　おもひでに',
    answer: 'いまひとたびの　あふこともがな'
  },
  {
    question: 'めぐりあひて　みしやそれとも　わかぬまに',
    answer: 'くもがくれにし　よはのつきかな'
  },
  {
    question: 'ありまやま　ゐなのささはら　かぜふけば',
    answer: 'いでそよひとを　わすれやはする'
  },
  {
    question: 'やすらはで　ねなましものを　さよふけて',
    answer: 'かたぶくまでの　つきをみしかな'
  },
  {
    question: 'おほえやま　いくののみちの　とほければ',
    answer: 'まだふみもみず　あまのはしだて'
  },
  {
    question: 'いにしへの　ならのみやこの　やへざくら',
    answer: 'けふここのへに　にほひぬるかな'
  },
  {
    question: 'よをこめて　とりのそらねは　はかるとも',
    answer: 'よにあふさかの　せきはゆるさじ'
  },
  {
    question: 'いまはただ　おもひたえなむ　とばかりを',
    answer: 'ひとづてならで　いふよしもがな'
  },
  {
    question: 'あさぼらけ　うぢのかはぎり　たえだえに',
    answer: 'あらはれわたる　せぜのあじろぎ'
  },
  {
    question: 'うらみわび　ほさぬそでだに　あるものを',
    answer: 'こひにくちなむ　なこそをしけれ'
  },
  {
    question: 'もろともに　あはれとおもへ　やまざくら',
    answer: 'はなよりほかに　しるひともなし'
  },
  {
    question: 'はるのよの　ゆめばかりなる　たまくらに',
    answer: 'かひなくたたむ　なこそをしけれ'
  },
  {
    question: 'こころにも　あらでうきよに　ながらへば',
    answer: 'こひしかるべき　よはのつきかな'
  },
  {
    question: 'あらしふく　みむろのやまの　もみぢばは',
    answer: 'たつたのかはの　にしきなりけり'
  },
  {
    question: 'さびしさに　やどをたちいでて　ながむれば',
    answer: 'いづこもおなじ　あきのゆふぐれ'
  },
  {
    question: 'ゆふされば　かどたのいなば　おとづれて',
    answer: 'あしのまろやに　あきかぜぞふく'
  },
  {
    question: 'おとにきく　たかしのはまの　あだなみは',
    answer: 'かけじやそでの　ぬれもこそすれ'
  },
  {
    question: 'たかさごの　をのへのさくら　さきにけり',
    answer: 'とやまのかすみ　たたずもあらなむ'
  },
  {
    question: 'うかりける　ひとをはつせの　やまおろしよ',
    answer: 'はげしかれとは　いのらぬものを'
  },
  {
    question: 'ちぎりおきし　させもがつゆを　いのちにて',
    answer: 'あはれことしの　あきもいぬめり'
  },
  {
    question: 'わたのはら　こぎいでてみれば　ひさかたの',
    answer: 'くもゐにまがふ　おきつしらなみ'
  },
  {
    question: 'せをはやみ　いはにせかるる　たきがはの',
    answer: 'われてもすゑに　あはむとぞおもふ'
  },
  {
    question: 'あはぢしま　かよふちどりの　なくこゑに',
    answer: 'いくよねざめぬ　すまのせきもり'
  },
  {
    question: 'あきかぜに　たなびくくもの　たえまより',
    answer: 'もれいづるつきの　かげのさやけさ'
  },
  {
    question: 'ながからむ　こころもしらず　くろかみの',
    answer: 'みだれてけさは　ものをこそおもへ'
  },
  {
    question: 'ほととぎす　なきつるかたを　ながむれば',
    answer: 'ただありあけの　つきぞのこれる'
  },
  {
    question: 'おもひわび　さてもいのちは　あるものを',
    answer: 'うきにたへぬは　なみだなりけり'
  },
  {
    question: 'よのなかよ　みちこそなけれ　おもひいる',
    answer: 'やまのおくにも　しかぞなくなる'
  },
  {
    question: 'ながらへば　またこのごろや　しのばれむ',
    answer: 'うしとみしよぞ　いまはこひしき'
  },
  {
    question: 'よもすがら　ものおもふころは　あけやらで',
    answer: 'ねやのひまさへ　つれなかりけり'
  },
  {
    question: 'なげけとて　つきやはものを　おもはする',
    answer: 'かこちがほなる　わがなみだかな'
  },
  {
    question: 'むらさめの　つゆもまだひぬ　まきのはに',
    answer: 'きりたちのぼる　あきのゆふぐれ'
  },
  {
    question: 'なにはえの　あしのかりねの　ひとよゆゑ',
    answer: 'みをつくしてや　こひわたるべき'
  },
  {
    question: 'たまのをよ　たえなばたえね　ながらへば',
    answer: 'しのぶることの　よわりもぞする'
  },
  {
    question: 'みせばやな　をじまのあまの　そでだにも',
    answer: 'ぬれにぞぬれし　いろはかはらず'
  },
  {
    question: 'きりぎりす　なくやしもよの　さむしろに',
    answer: 'ころもかたしき　ひとりかもねむ'
  },
  {
    question: 'わがそでは　しほひにみえぬ　おきのいしの',
    answer: 'ひとこそしらね　かわくまもなし'
  },
  {
    question: 'よのなかは　つねにもがもな　なぎさこぐ',
    answer: 'あまのをぶねの　つなでかなしも'
  },
  {
    question: 'みよしのの　やまのあきかぜ　さよふけて',
    answer: 'ふるさとさむく　ころもうつなり'
  },
  {
    question: 'おほけなく　うきよのたみに　おほふかな',
    answer: 'わがたつそまに　すみぞめのそで'
  },
  {
    question: 'はなさそふ　あらしのにはの　ゆきならで',
    answer: 'ふりゆくものは　わがみなりけり'
  },
  {
    question: 'こぬひとを　まつほのうらの　ゆふなぎに',
    answer: 'やくやもしほの　みもこがれつつ'
  },
  {
    question: 'かぜそよぐ　ならのをがはの　ゆふぐれは',
    answer: 'みそぎぞなつの　しるしなりける'
  },
  {
    question: 'ひともをし　ひともうらめし　あぢきなく',
    answer: 'よをおもふゆゑに　ものおもふみは'
  },
  {
    question: 'ももしきや　ふるきのきばの　しのぶにも',
    answer: 'なほあまりある　むかしなりけり'
  }
]
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
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}
</style>

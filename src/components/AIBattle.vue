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
</style>

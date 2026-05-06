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
          {{ this.enableSpeak ? "○" : "✕" }} よみあげ{{
            this.enableSpeak ? "あり" : "なし"
          }}
        </button>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-sm-10 cont main-container bg-secondary text-dark">
        <p v-html="questionData.question"></p>
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
    questions.forEach((q, i) => { q.id = i + 1 })
    this.questionList = _.shuffle(questions)
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
        this.$store.dispatch('collection/addCollectedPoem', this.questionData.id)

        let rightSound = document.getElementById('right-sound')
        rightSound.play()
      } else {
        let wrongSound = document.getElementById('wrong-sound')
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
      this.questionData = this.questionList[this.currentQuestionIndex]
      let dummies = _.shuffle(
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
  content: " ×";
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
  content: " ○";
  color: blue;
  font-weight: bold;
}
</style>

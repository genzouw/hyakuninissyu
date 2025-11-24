<template>
  <div class="daily-challenge-container">
    <!-- 既にクリア済みの場合 -->
    <div v-if="alreadyCompleted" class="row justify-content-center">
      <div class="col-md-8">
        <div class="card bg-success text-white mb-4">
          <div class="card-body text-center">
            <h2 class="mb-3">🎉 今日のチャレンジクリア！</h2>
            <p class="lead">おめでとうございます！</p>
            <p class="mb-0">次のチャレンジは明日です。</p>
          </div>
        </div>

        <div class="card bg-info text-white">
          <div class="card-body text-center">
            <h3 class="mb-3">⏰ 次のチャレンジまで</h3>
            <div class="countdown display-4">
              {{ countdown.hours }}:{{ String(countdown.minutes).padStart(2, '0') }}:{{ String(countdown.seconds).padStart(2, '0') }}
            </div>
          </div>
        </div>

        <div class="text-center mt-4">
          <router-link to="/" class="btn btn-lg btn-primary">
            トップへ戻る
          </router-link>
        </div>
      </div>
    </div>

    <!-- チャレンジ中 -->
    <div v-else>
      <!-- ヘッダー -->
      <div class="row mb-3">
        <div class="col-auto">
          <h2>📅 今日のチャレンジ</h2>
        </div>
        <div class="col-auto">
          <span class="badge badge-primary badge-lg">
            {{ currentQuestionIndex + 1 }} / 5
          </span>
        </div>
        <div class="col-auto">
          <span class="badge badge-success badge-lg">
            🔥 {{ currentStreak }}日連続
          </span>
        </div>
      </div>

      <!-- 問題表示 -->
      <div class="row justify-content-center">
        <div class="col-sm-10 cont main-container bg-secondary text-dark">
          <p v-html="questionData.question"></p>
          <div class="row">
            <div
              class="col-sm-12"
              v-for="(c, i) in questionData.choices"
              :key="c"
            >
              <label
                class="option"
                :class="{
                  correct: !thinking && c === questionData.answer,
                  choiced: !thinking && c === choice,
                }"
              >
                <input
                  type="radio"
                  v-model="choice"
                  :value="c"
                  :disabled="!thinking"
                  @change="clickAnswer"
                />
                <span>({{ i + 1 }}) {{ c }}</span>
              </label>
            </div>
          </div>
          <div class="row justify-content-center">
            <div class="col-sm-12">
              <button
                class="btn btn-lg btn-primary btn-block"
                :disabled="thinking"
                @click="clickNext"
              >
                次へ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- イラスト -->
      <div class="row justify-content-center">
        <div class="col-auto text-center">
          <img
            src="@/assets/hyakunin_issyu.png"
            class="img-fluid w-75 center-block"
            alt=""
          />
        </div>
      </div>
    </div>

    <!-- サウンド -->
    <audio ref="rightSoundDaily" preload>
      <source src="@/assets/right.mp3" type="audio/mp3" />
    </audio>
    <audio ref="wrongSoundDaily" preload>
      <source src="@/assets/wrong.mp3" type="audio/mp3" />
    </audio>
  </div>
</template>

<script>
import _ from 'underscore'
import { poems } from '@/data/poems'
import {
  getTodaysChallengePoems,
  isTodaysChallengeCompleted,
  getCurrentStreak,
  updateStreak,
  markTodaysChallengeCompleted,
  getTimeUntilNextChallenge
} from '@/utils/dailyChallenge'

export default {
  name: 'DailyChallenge',
  data () {
    return {
      alreadyCompleted: false,
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
      currentStreak: 0,
      countdown: {
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      countdownInterval: null
    }
  },
  mounted () {
    // 既にクリア済みかチェック
    if (isTodaysChallengeCompleted()) {
      this.alreadyCompleted = true
      this.currentStreak = getCurrentStreak()
      this.startCountdown()
    } else {
      // 今日のチャレンジ用の5首を取得
      const todaysPoems = getTodaysChallengePoems(poems)
      this.questionList = todaysPoems.map(poem => ({
        id: poem.id,
        question: poem.question,
        answer: poem.answer,
        choices: []
      }))

      // 選択肢を生成
      const allAnswers = poems.map(p => p.answer)
      this.questionList.forEach(q => {
        const dummies = _.shuffle(
          allAnswers.filter(a => a !== q.answer)
        ).slice(0, 3)
        q.choices = _.shuffle([q.answer, ...dummies])
      })

      this.currentStreak = getCurrentStreak()
      this.loadQuestion()
    }
  },
  beforeDestroy () {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
    }
  },
  methods: {
    clickAnswer () {
      this.thinking = false

      // 正解したら
      if (this.questionData.answer === this.choice) {
        this.score++
        const rightSound = this.$refs.rightSoundDaily
        rightSound.play()

        // コレクション図鑑に追加
        const poemId = this.questionData.id
        this.addToCollection(poemId)
      } else {
        const wrongSound = this.$refs.wrongSoundDaily
        wrongSound.play()
      }
    },
    clickNext () {
      this.currentQuestionIndex++

      if (this.currentQuestionIndex < 5) {
        this.loadQuestion()
      } else {
        // 全問終了
        const isSuccess = this.score === 5
        const previousStreak = this.currentStreak
        updateStreak(isSuccess)

        if (isSuccess) {
          markTodaysChallengeCompleted()
        }

        const newStreak = getCurrentStreak()
        this.$router.push({
          name: 'DailyChallengeResult',
          params: {
            score: this.score,
            streak: newStreak,
            previousStreak: previousStreak
          }
        })
      }
    },
    loadQuestion () {
      this.questionData = this.questionList[this.currentQuestionIndex]
      this.choice = null
      this.thinking = true
    },
    addToCollection (poemId) {
      const collectedPoemIds = JSON.parse(localStorage.getItem('collectedPoemIds') || '[]')
      if (!collectedPoemIds.includes(poemId)) {
        collectedPoemIds.push(poemId)
        localStorage.setItem('collectedPoemIds', JSON.stringify(collectedPoemIds))
      }
    },
    startCountdown () {
      this.updateCountdown()
      this.countdownInterval = setInterval(() => {
        this.updateCountdown()
      }, 1000)
    },
    updateCountdown () {
      this.countdown = getTimeUntilNextChallenge()
    }
  }
}
</script>

<style scoped>
.daily-challenge-container {
  padding: 20px;
}

.main-container {
  padding: 30px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.main-container p {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 30px;
}

.option {
  display: block;
  padding: 15px;
  margin-bottom: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.option:hover {
  background: #f8f9fa;
  border-color: #007bff;
}

.option input {
  margin-right: 10px;
}

.option.correct {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.option.choiced {
  background: #f8d7da;
  border-color: #dc3545;
  color: #721c24;
}

.badge-lg {
  font-size: 1.2rem;
  padding: 8px 15px;
}

.countdown {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  margin: 20px 0;
}
</style>

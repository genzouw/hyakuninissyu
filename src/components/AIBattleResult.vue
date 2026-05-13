<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header text-white text-center" :class="resultHeaderClass">
            <h2>{{ resultTitle }}</h2>
          </div>
          <div class="card-body text-center">
            <!-- 勝敗表示 -->
            <div class="mb-4">
              <h1 class="display-1">{{ resultEmoji }}</h1>
            </div>

            <!-- スコア表示 -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card" :class="playerWon ? 'bg-primary text-white' : 'bg-light'">
                  <div class="card-body">
                    <h5>👤 あなた</h5>
                    <h1>{{ playerScore }} / {{ totalQuestions }}</h1>
                    <p class="mb-0">正答率: {{ playerAccuracy }}%</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card" :class="aiWon ? 'bg-danger text-white' : 'bg-light'">
                  <div class="card-body">
                    <h5>🤖 AI</h5>
                    <h1>{{ aiScore }} / {{ totalQuestions }}</h1>
                    <p class="mb-0">正答率: {{ aiAccuracy }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ゲーム情報 -->
            <div class="card bg-light mb-4">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>問題数</h6>
                    <p class="mb-0">{{ totalQuestions }}問</p>
                  </div>
                  <div class="col-md-6">
                    <h6>難易度</h6>
                    <p class="mb-0">{{ difficultyLabel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 結果メッセージ -->
            <div class="alert" :class="resultAlertClass">
              {{ resultMessage }}
            </div>

            <!-- アクションボタン -->
            <div class="mt-4">
              <router-link to="/ai-battle" class="btn btn-danger btn-lg mr-2">
                🤖 もう一度対戦
              </router-link>
              <router-link to="/time-attack" class="btn btn-success btn-lg mr-2">
                ⏱️ タイムアタックに挑戦
              </router-link>
              <router-link to="/" class="btn btn-outline-primary btn-lg">
                ホームに戻る
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      playerScore: 0,
      aiScore: 0,
      totalQuestions: 0,
      difficulty: 'normal'
    }
  },
  computed: {
    playerWon () {
      return this.playerScore > this.aiScore
    },
    aiWon () {
      return this.aiScore > this.playerScore
    },
    isDraw () {
      return this.playerScore === this.aiScore
    },
    playerAccuracy () {
      return ((this.playerScore / this.totalQuestions) * 100).toFixed(1)
    },
    aiAccuracy () {
      return ((this.aiScore / this.totalQuestions) * 100).toFixed(1)
    },
    resultTitle () {
      if (this.playerWon) {
        return 'あなたの勝ち！'
      } else if (this.aiWon) {
        return 'AIの勝ち...'
      } else {
        return '引き分け'
      }
    },
    resultEmoji () {
      if (this.playerWon) {
        return '🎉'
      } else if (this.aiWon) {
        return '😢'
      } else {
        return '🤝'
      }
    },
    resultHeaderClass () {
      if (this.playerWon) {
        return 'bg-success'
      } else if (this.aiWon) {
        return 'bg-danger'
      } else {
        return 'bg-warning'
      }
    },
    resultAlertClass () {
      if (this.playerWon) {
        return 'alert-success'
      } else if (this.aiWon) {
        return 'alert-danger'
      } else {
        return 'alert-warning'
      }
    },
    resultMessage () {
      const scoreDiff = Math.abs(this.playerScore - this.aiScore)

      if (this.playerWon) {
        if (scoreDiff >= 5) {
          return '完璧な勝利です！次は難易度を上げてみましょう！'
        } else if (scoreDiff >= 3) {
          return 'すばらしい！AIに勝ちました！'
        } else {
          return 'ぎりぎりの勝利！接戦でしたね！'
        }
      } else if (this.aiWon) {
        if (scoreDiff >= 5) {
          return 'もう一度挑戦してみましょう！練習あるのみです！'
        } else if (scoreDiff >= 3) {
          return '惜しい！もう少しでAIに勝てそうです！'
        } else {
          return 'あと一歩！次こそ勝ちましょう！'
        }
      } else {
        return '引き分けです！実力が拮抗していますね！'
      }
    },
    difficultyLabel () {
      const difficultyMap = {
        easy: 'やさしい',
        normal: 'ふつう',
        hard: 'むずかしい'
      }
      return difficultyMap[this.difficulty] || 'ふつう'
    }
  },
  mounted () {
    // ルートパラメータから値を取得
    this.playerScore = parseInt(this.$route.params.playerScore) || 0
    this.aiScore = parseInt(this.$route.params.aiScore) || 0
    this.totalQuestions = parseInt(this.$route.params.totalQuestions) || 10
    this.difficulty = this.$route.params.difficulty || 'normal'
  }
}
</script>

<style scoped>
.display-1 {
  font-size: 6rem;
}

.card-header h2 {
  margin: 0;
}

.card-body h1 {
  font-size: 3rem;
  font-weight: bold;
}
</style>

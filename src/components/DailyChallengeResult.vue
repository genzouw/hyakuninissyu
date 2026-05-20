<template>
  <div class="daily-challenge-result-container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- 結果表示 -->
        <div class="result-card" :class="resultClass">
          <div class="card-body text-center">
            <h1 class="display-1 mb-3">{{ emoji }}</h1>
            <h2 class="mb-4">{{ resultMessage }}</h2>

            <div class="score-display mb-4">
              <p class="score-label">今日のスコア</p>
              <p class="score-value">{{ score }} / 5</p>
            </div>

            <div v-if="isPerfect" class="perfect-bonus mb-4">
              <h3>🏆 パーフェクト！</h3>
              <p class="lead">5問全て正解しました！</p>
            </div>

            <div class="streak-display mb-4">
              <h3 class="streak-title">🔥 連続達成記録</h3>
              <p class="streak-value">{{ currentStreak }}日連続</p>
              <p v-if="streakIncreased" class="streak-message text-success">
                連続記録が更新されました！
              </p>
              <p v-else-if="streakReset" class="streak-message text-warning">
                連続記録がリセットされました。明日また挑戦しましょう！
              </p>
            </div>

            <div v-if="collectedCount > 0" class="collection-update mb-4">
              <p class="text-muted">
                ✅ {{ collectedCount }}首をコレクション図鑑に追加しました
              </p>
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="row mt-4">
          <div class="col-6">
            <router-link
              to="/collection"
              class="btn btn-lg btn-success btn-block"
            >
              📚 コレクション図鑑
            </router-link>
          </div>
          <div class="col-6">
            <router-link to="/badges" class="btn btn-lg btn-warning btn-block">
              🎖️ バッジコレクション
            </router-link>
          </div>
        </div>

        <div class="text-center mt-4">
          <router-link to="/" class="btn btn-lg btn-primary ps-5 pe-5">
            トップへ戻る
          </router-link>
        </div>

        <!-- 次のチャレンジ告知 -->
        <div class="card bg-info text-white mt-4">
          <div class="card-body text-center">
            <h4 class="mb-2">次のチャレンジは明日！</h4>
            <p class="mb-0">毎日続けて記録を伸ばそう 🎯</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DailyChallengeResult',
  data () {
    return {
      score: 0,
      currentStreak: 0,
      previousStreak: 0,
      collectedCount: 0,
    }
  },
  computed: {
    isPerfect () {
      return this.score === 5
    },
    resultClass () {
      if (this.isPerfect) {
        return 'card bg-gradient-gold text-white'
      } else if (this.score >= 3) {
        return 'card bg-gradient-success text-white'
      } else {
        return 'card bg-gradient-info text-white'
      }
    },
    emoji () {
      if (this.isPerfect) return '🏆'
      if (this.score >= 4) return '🎉'
      if (this.score >= 3) return '👏'
      if (this.score >= 1) return '💪'
      return '📝'
    },
    resultMessage () {
      if (this.isPerfect) return 'パーフェクト！'
      if (this.score >= 4) return 'すばらしい！'
      if (this.score >= 3) return 'よくできました！'
      if (this.score >= 1) return 'がんばりました！'
      return '明日またちょうせん！'
    },
    streakIncreased () {
      return this.currentStreak > this.previousStreak && this.currentStreak > 0
    },
    streakReset () {
      return this.currentStreak === 0 && this.previousStreak > 0
    },
  },
  mounted () {
    this.score = parseInt(this.$route.params.score, 10) || 0
    this.currentStreak = parseInt(this.$route.params.streak, 10) || 0
    this.previousStreak = parseInt(this.$route.params.previousStreak, 10) || 0
    this.collectedCount =
      parseInt(this.$route.params.newlyCollectedCount, 10) || 0
  },
}
</script>

<style scoped>
.daily-challenge-result-container {
  padding: 20px;
  min-height: 80vh;
}

.result-card {
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.bg-gradient-gold {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
}

.bg-gradient-success {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
}

.bg-gradient-info {
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}

.score-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 30px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 300px;
}

.score-label {
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.score-value {
  font-size: 4rem;
  font-weight: bold;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.perfect-bonus {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px;
  border-radius: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.streak-display {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 10px;
}

.streak-title {
  margin-bottom: 15px;
}

.streak-value {
  font-size: 3rem;
  font-weight: bold;
  margin: 10px 0;
  font-family: 'Courier New', monospace;
}

.streak-message {
  font-size: 1.1rem;
  font-weight: bold;
  margin-top: 10px;
}

.collection-update {
  font-size: 1.1rem;
}
</style>

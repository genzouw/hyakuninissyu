<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-primary text-white text-center">
            <h2>タイムアタック完了！</h2>
          </div>
          <div class="card-body text-center">
            <h3 class="mb-4">クリアタイム</h3>
            <h1 class="display-1 text-primary mb-4">{{ formattedTime }}</h1>

            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h5>正解数</h5>
                    <h3>{{ score }} / 100</h3>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h5>正答率</h5>
                    <h3>{{ accuracy }}%</h3>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <router-link to="/" class="btn btn-primary btn-lg me-2">ホームに戻る</router-link>
              <router-link to="/time-attack" class="btn btn-success btn-lg">もう一度挑戦</router-link>
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
      timeMs: 0,
      score: 0
    }
  },
  computed: {
    formattedTime () {
      return this.formatTimeMs(this.timeMs)
    },
    accuracy () {
      return ((this.score / 100) * 100).toFixed(1)
    }
  },
  mounted () {
    this.timeMs = parseInt(this.$route.params.timeMs)
    this.score = parseInt(this.$route.params.score)
  },
  methods: {
    formatTimeMs (ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      const milliseconds = Math.floor((ms % 1000) / 10)
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.display-1 {
  font-weight: bold;
  font-size: 4rem;
}

.card-header h2 {
  margin: 0;
}
</style>

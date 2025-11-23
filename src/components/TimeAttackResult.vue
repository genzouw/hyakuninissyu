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

            <div v-if="saving" class="alert alert-info">
              <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
              記録を保存中...
            </div>

            <div v-if="saved" class="alert alert-success">
              記録を保存しました！
            </div>

            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div v-if="isPersonalBest && saved" class="alert alert-warning">
              <strong>🎉 自己ベスト更新！</strong>
            </div>

            <div class="mt-4">
              <h4>グローバルランキング TOP 10</h4>
              <div v-if="loadingRanking" class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              <table v-else class="table table-striped mt-3">
                <thead>
                  <tr>
                    <th>順位</th>
                    <th>プレイヤー</th>
                    <th>タイム</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in ranking" :key="index" :class="{ 'table-info': record.isCurrentUser }">
                    <td>{{ index + 1 }}</td>
                    <td>{{ record.user_name }}</td>
                    <td>{{ formatTimeMs(record.time_ms) }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="text-center mt-3">
                <router-link to="/ranking" class="btn btn-info">📊 全ランキングを見る</router-link>
              </div>
            </div>

            <div class="mt-4">
              <router-link to="/" class="btn btn-primary btn-lg mr-2">ホームに戻る</router-link>
              <router-link to="/time-attack" class="btn btn-success btn-lg mr-2">もう一度挑戦</router-link>
              <router-link to="/my-records" class="btn btn-outline-info btn-lg">マイ記録</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  data () {
    return {
      timeMs: 0,
      score: 0,
      saving: false,
      saved: false,
      error: null,
      isPersonalBest: false,
      ranking: [],
      loadingRanking: true
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

    // 記録を保存
    this.saveRecord()

    // ランキングを取得
    this.fetchRanking()
  },
  methods: {
    formatTimeMs (ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      const milliseconds = Math.floor((ms % 1000) / 10)
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    },
    async saveRecord () {
      this.saving = true
      this.error = null

      try {
        const user = firebase.auth().currentUser
        if (!user) {
          this.error = 'ログインが必要です'
          this.saving = false
          return
        }

        const db = firebase.firestore()

        // バリデーション: 理論上不可能なタイム（1秒以下）を弾く
        if (this.timeMs < 1000) {
          this.error = '無効な記録です'
          this.saving = false
          return
        }

        // 自己ベストをチェック
        const userRecordsSnapshot = await db.collection('time_attack_records')
          .where('uid', '==', user.uid)
          .orderBy('time_ms', 'asc')
          .limit(1)
          .get()

        if (userRecordsSnapshot.empty || userRecordsSnapshot.docs[0].data().time_ms > this.timeMs) {
          this.isPersonalBest = true
        }

        // 記録を保存
        await db.collection('time_attack_records').add({
          uid: user.uid,
          user_name: user.displayName || user.email || 'Anonymous',
          time_ms: this.timeMs,
          score: this.score,
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        })

        this.saved = true
      } catch (err) {
        console.error('Error saving record:', err)
        this.error = '記録の保存に失敗しました: ' + err.message
      } finally {
        this.saving = false
      }
    },
    async fetchRanking () {
      this.loadingRanking = true

      try {
        const db = firebase.firestore()
        const currentUser = firebase.auth().currentUser

        const snapshot = await db.collection('time_attack_records')
          .orderBy('time_ms', 'asc')
          .limit(10)
          .get()

        this.ranking = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            isCurrentUser: currentUser && data.uid === currentUser.uid
          }
        })
      } catch (err) {
        console.error('Error fetching ranking:', err)
      } finally {
        this.loadingRanking = false
      }
    }
  }
}
</script>

<style scoped>
.display-1 {
  font-weight: bold;
  font-size: 4rem;
}

.table-info {
  background-color: #d1ecf1 !important;
  font-weight: bold;
}

.card-header h2 {
  margin: 0;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>

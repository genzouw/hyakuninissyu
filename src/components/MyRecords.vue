<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card">
          <div class="card-header bg-success text-white text-center">
            <h2>📊 マイ記録</h2>
          </div>
          <div class="card-body">
            <div v-if="!isLoggedIn" class="alert alert-warning text-center">
              <p>この機能を使用するにはログインが必要です。</p>
              <router-link to="/signIn" class="btn btn-primary">ログイン</router-link>
            </div>

            <div v-else-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div v-else>
              <div v-if="records.length === 0" class="alert alert-info text-center">
                <p>まだ記録がありません。</p>
                <router-link to="/time-attack" class="btn btn-primary">タイムアタックに挑戦</router-link>
              </div>

              <div v-else>
                <div class="mb-4">
                  <h4>🏅 自己ベスト</h4>
                  <div v-if="bestRecord" class="card bg-light">
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-4">
                          <h5>タイム</h5>
                          <h2 class="text-primary">{{ formatTimeMs(bestRecord.time_ms) }}</h2>
                        </div>
                        <div class="col-md-4">
                          <h5>正答率</h5>
                          <h2>{{ getAccuracy(bestRecord.score) }}%</h2>
                        </div>
                        <div class="col-md-4">
                          <h5>達成日</h5>
                          <p>{{ formatDate(bestRecord.created_at) }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h4>全記録 ({{ records.length }}件)</h4>
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>タイム</th>
                      <th>正答率</th>
                      <th>日時</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(record, index) in records" :key="index" :class="{ 'table-warning': isBestRecord(record) }">
                      <td>{{ index + 1 }}</td>
                      <td>
                        <strong>{{ formatTimeMs(record.time_ms) }}</strong>
                        <span v-if="isBestRecord(record)" class="badge badge-warning ml-2">自己ベスト</span>
                      </td>
                      <td>{{ getAccuracy(record.score) }}%</td>
                      <td>{{ formatDate(record.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-4 text-center">
              <router-link to="/ranking" class="btn btn-info mr-2">ランキングを見る</router-link>
              <router-link to="/time-attack" class="btn btn-success mr-2">もう一度挑戦</router-link>
              <router-link to="/" class="btn btn-outline-primary">ホームに戻る</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app'

export default {
  data () {
    return {
      records: [],
      bestRecord: null,
      loading: true,
      error: null,
      isLoggedIn: false
    }
  },
  mounted () {
    this.checkAuth()
  },
  methods: {
    checkAuth () {
      firebase.auth().onAuthStateChanged(user => {
        this.isLoggedIn = !!user
        if (user) {
          this.fetchMyRecords()
        } else {
          this.loading = false
        }
      })
    },
    async fetchMyRecords () {
      this.loading = true
      this.error = null

      try {
        const user = firebase.auth().currentUser
        if (!user) {
          this.error = 'ログインが必要です'
          this.loading = false
          return
        }

        const db = firebase.firestore()

        const snapshot = await db.collection('time_attack_records')
          .where('uid', '==', user.uid)
          .orderBy('created_at', 'desc')
          .get()

        this.records = snapshot.docs.map(doc => doc.data())

        // 自己ベストを特定（最小time_ms）
        if (this.records.length > 0) {
          this.bestRecord = this.records.reduce((best, current) => {
            return (!best || current.time_ms < best.time_ms) ? current : best
          }, null)
        }
      } catch (err) {
        console.error('Error fetching my records:', err)
        this.error = '記録の取得に失敗しました: ' + err.message
      } finally {
        this.loading = false
      }
    },
    isBestRecord (record) {
      return this.bestRecord && record.time_ms === this.bestRecord.time_ms &&
             record.created_at === this.bestRecord.created_at
    },
    formatTimeMs (ms) {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      const milliseconds = Math.floor((ms % 1000) / 10)
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    },
    getAccuracy (score) {
      return ((score / 100) * 100).toFixed(1)
    },
    formatDate (timestamp) {
      if (!timestamp) return '-'
      const date = timestamp.toDate()
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${year}/${month}/${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.table-warning {
  background-color: #fff3cd !important;
  font-weight: bold;
}

.card-header h2 {
  margin: 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>

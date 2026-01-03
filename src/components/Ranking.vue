<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card">
          <div class="card-header bg-primary text-white text-center">
            <h2>🏆 タイムアタック グローバルランキング</h2>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>

            <div v-else-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <div v-else>
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>順位</th>
                    <th>プレイヤー</th>
                    <th>タイム</th>
                    <th>正答率</th>
                    <th>日時</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(record, index) in ranking" :key="index" :class="{ 'table-info': record.isCurrentUser }">
                    <td>
                      <strong>{{ getRank(index) }}</strong>
                      <span v-if="getRank(index) === 1">🥇</span>
                      <span v-if="getRank(index) === 2">🥈</span>
                      <span v-if="getRank(index) === 3">🥉</span>
                    </td>
                    <td>
                      {{ record.user_name }}
                      <span v-if="record.isCurrentUser" class="badge badge-success ml-2">あなた</span>
                    </td>
                    <td><strong>{{ formatTimeMs(record.time_ms) }}</strong></td>
                    <td>{{ getAccuracy(record.score) }}%</td>
                    <td>{{ formatDate(record.created_at) }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="d-flex justify-content-between align-items-center mt-4">
                <button
                  class="btn btn-secondary"
                  :disabled="currentPage === 1"
                  @click="previousPage"
                >
                  « 前のページ
                </button>

                <span>ページ {{ currentPage }}</span>

                <button
                  class="btn btn-secondary"
                  :disabled="!hasMore"
                  @click="nextPage"
                >
                  次のページ »
                </button>
              </div>
            </div>

            <div class="mt-4 text-center">
              <router-link to="/my-records" class="btn btn-info mr-2">自分の記録を見る</router-link>
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
      ranking: [],
      loading: true,
      error: null,
      currentPage: 1,
      pageSize: 10,
      hasMore: false,
      lastVisible: null
    }
  },
  mounted () {
    this.fetchRanking()
  },
  methods: {
    async fetchRanking () {
      this.loading = true
      this.error = null

      try {
        const db = firebase.firestore()
        const currentUser = firebase.auth().currentUser

        let query = db.collection('time_attack_records')
          .orderBy('time_ms', 'asc')
          .limit(this.pageSize + 1)

        if (this.lastVisible) {
          query = query.startAfter(this.lastVisible)
        }

        const snapshot = await query.get()

        // ページネーション用：pageSize+1件取得して、hasMoreを判定
        this.hasMore = snapshot.docs.length > this.pageSize
        const docs = this.hasMore ? snapshot.docs.slice(0, this.pageSize) : snapshot.docs

        this.ranking = docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            isCurrentUser: currentUser && data.uid === currentUser.uid
          }
        })

        if (docs.length > 0) {
          this.lastVisible = docs[docs.length - 1]
        }
      } catch (err) {
        console.error('Error fetching ranking:', err)
        this.error = 'ランキングの取得に失敗しました: ' + err.message
      } finally {
        this.loading = false
      }
    },
    async nextPage () {
      if (!this.hasMore) return
      this.currentPage++
      await this.fetchRanking()
    },
    async previousPage () {
      if (this.currentPage === 1) return
      // Firestoreは前方ページネーションのみサポート
      // ページを戻る場合は、最初から現在のページまで再取得
      this.currentPage--
      this.lastVisible = null

      // 最初のページに戻る場合
      if (this.currentPage === 1) {
        await this.fetchRanking()
        return
      }

      // 指定ページまで移動
      const db = firebase.firestore()
      const targetDocs = this.pageSize * (this.currentPage - 1)

      const snapshot = await db.collection('time_attack_records')
        .orderBy('time_ms', 'asc')
        .limit(targetDocs)
        .get()

      if (snapshot.docs.length > 0) {
        this.lastVisible = snapshot.docs[snapshot.docs.length - 1]
      }

      await this.fetchRanking()
    },
    getRank (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
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
.table-info {
  background-color: #d1ecf1 !important;
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

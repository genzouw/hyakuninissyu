<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h2>メールアドレス</h2>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-auto">
        <p>{{ user.email }}</p>
      </div>
    </div>

    <div class="row">
      <div class="col-auto">
        <h2>いままでのテストかいすう</h2>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-auto">
        {{ reversedScores.length }} かい
      </div>
    </div>

    <div class="row">
      <div class="col-auto">
        <h2>いままでのてんすう</h2>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-auto">
        <table class="table table-striped table-bordered table-condensed">
          <colgroup>
            <col>
            <col>
            <col>
          </colgroup>
          <thead>
            <tr>
              <th>にちじ</th>
              <th>もんだい</th>
              <th>てんすう</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in reversedScores" :key="s.id">
              <td>{{ s.createdAt }}</td>
              <td>{{ s.countOfQuestions }}</td>
              <td>{{ s.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import moment from 'moment'

export default {
  data () {
    return {
      scores: []
    }
  },
  created () {
    moment.locale('ja')
    this.fetchData()
  },
  watch: {
    $route: 'fetchData'
  },
  methods: {
    unixtimeToString (unixtime) {
      return moment.unix(Number(unixtime)).format('Mがつ Dにち (ddd) HH:mm')
    },
    fetchData () {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          let db = firebase.firestore()

          let usersRef = db.collection('users')

          usersRef.doc(user.email).get().then((doc) => {
            if (doc.exists) {
              this.scores = doc.data()
            }
          })
        }
      })
    }
  },
  computed: {
    reversedScores () {
      let keys = Object.keys(this.scores).reverse()

      let scores = []

      let k
      for (k of keys) {
        scores.push({
          createdAt: this.unixtimeToString(k),
          countOfQuestions: this.scores[k].countOfQuestions,
          score: this.scores[k].score
        })
      }

      return scores
    },
    user () {
      return this.$store.state.user
    }
  }
}
</script>

<style scoped>
thead {
  text-align: center;
}
tbody > tr > td:nth-child(1) {
  text-align: center;
}
tbody > tr > td:nth-child(2), tbody > tr > td:nth-child(3) {
  text-align: right;
}
</style>

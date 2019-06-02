<template>
  <div>
    <div class="row justify-content-center" id="app">
      <div class="col-sm-10">
        <div class="cont result bg-dark text-light">
          <p style="font-size: 80%;">{{ countOfQuestions }}もん のうち</p>
          <p>{{ score }}もん せいかい</p>
          <p>でした。</p>
        </div>
        <div class="row justify-content-center">
          <div class="col-auto">
            <p><strong>よろしければしぇあをおねがいします！</strong></p>
            <h3>
              <router-link to="/" class="btn btn-primary btn-lg">もういっかいちゃれんじ！</router-link>
            </h3>
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
      countOfQuestions: 0,
      score: 0
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    '$route': 'fetchData'
  },
  methods: {
    fetchData () {
      this.countOfQuestions = Number(this.$route.params.countOfQuestions)
      this.score = Number(this.$route.params.score)
    }
  },
  computed: {
    result () {
      return ` ${this.score}もん せいかい ( ${this.countOfQuestions}もんちゅう )`
    }
  }
}
</script>

<style scoped>
.result {
  text-align: center;
  font-size: 45px;
}
</style>

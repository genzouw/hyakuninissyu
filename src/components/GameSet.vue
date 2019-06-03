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
            <p>
              <a class="twitter-share-button" href="//twitter.com/intent/tweet?text=%E3%80%8C%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85%E3%82%92%E3%81%8A%E3%81%BC%E3%81%88%E3%82%88%E3%81%86%E3%80%8D%E3%81%A7%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96%E3%82%92%E6%A5%BD%E3%81%97%E3%81%8F%E5%AD%A6%E3%81%BC%E3%81%86%EF%BC%81%0A%23%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85+%23%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96+%23%E6%97%A5%E6%9C%AC%E8%AA%9E+%23%E5%8F%A4%E5%85%B8%0A%0Ahttps%3A%2F%2Fhyakuninissyu.genzouw.com" data-size="large" data-text="ひゃくにんいっしゅをおぼえよう" data-url="">しぇあ</a>
            </p>
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

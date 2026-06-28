<template>
  <div>
    <div class="row justify-content-center">
      <div class="col-sm-10">
        <div class="result bg-dark text-light">
          <p>{{ countOfQuestions }}もん のうち</p>
          <p class="score">{{ score }}もん せいかい</p>
          <p>でした。</p>
        </div>

        <div class="row justify-content-center">
          <div class="col-auto">
            <p>
              <strong>よろしければシェアをおねがいします！</strong>
            </p>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-auto">
            <p>
              <a
                class="twitter-share-button"
                :href="TWITTER_SHARE_URL"
                data-size="large"
                data-text="ひゃくにんいっしゅをおぼえよう"
                data-url="https://hyakuninissyu.genzouw.com"
              >シェア</a>
            </p>
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-auto">
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
import { TWITTER_SHARE_URL } from '../constants/url'

export default {
  data () {
    return {
      countOfQuestions: 0,
      score: 0,
      TWITTER_SHARE_URL
    }
  },
  created () {
    this.fetchData()
  },
  watch: {
    $route: 'fetchData'
  },
  methods: {
    fetchData () {
      this.countOfQuestions = Number(this.$route.params.countOfQuestions)
      this.score = Number(this.$route.params.score)
    }
  },
  computed: {
    result () {
      return ` ${this.score}もん せいかい ( ${
        this.countOfQuestions
      }もんちゅう )`
    }
  }
}
</script>

<style scoped>
.result {
  text-align: center;
  font-size: 150%;
}

.result .score {
  font-size: 200%;
}
</style>

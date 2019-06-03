<template>
  <div>
    <div class="row justify-content-center" id="app">
      <div class="col-auto text-center">
        <h2>なんもんせいかいできるかな？</h2>
        <p class="intro">もんだいのかずをえらんだらはじてみよう。</p>
        <p class="intro"><input type="number" v-model="countOfQuestions" style="width: 3em; text-align: right;" max="40" />もん</p>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-auto text-center">
        <router-link v-bind:to="{ name: 'Playing', params: { countOfQuestions: countOfQuestions } }" class="btn btn-lg btn-primary start">はじめる</router-link>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-auto text-center">
        <img src="@/assets/hyakunin_issyu.png" class="img-fluid w-75 center-block" alt="">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  computed: {
    countOfQuestions: {
      get () {
        return this.$store.state.countOfQuestions
      },
      set (value) {
        this.$store.commit('updateCountOfQuestions', value)
      }
    }
  }
}
</script>

<style scoped>
.intro {
  font-size: 160%;
}
</style>

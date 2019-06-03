<template>
  <div>
    <div class="row justify-content-center" id="app">
      <div class="col-auto text-center">
        <h2>なんもんせいかいできるかな？</h2>
        <p class="intro">もんだいのかずをえらんだら「はじめる」ぼたんをおしてね。</p>
        <p class="intro">
          <input type="number" min="1" v-model="countOfQuestions" style="width: 3em; text-align: right;" max="100" />もん
        </p>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-sm-10 text-center">
        <router-link v-bind:to="{ name: 'Playing', params: { countOfQuestions: countOfQuestions } }" class="btn btn-lg btn-primary pl-5 pr-5">はじめる</router-link>
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
        if (value < 1) {
          value = 1
        } else if (value > 100) {
          value = 100
        }
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

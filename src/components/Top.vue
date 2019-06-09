<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h2>なんもんせいかいできるかな？</h2>
        <p>もんだいのかずをえらんだら「はじめる」ボタンをおしてね。</p>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-xs">
        <div class="form-group row">
          <label class="col-xs-6 col-form-label col-form-label-lg">もんだいのかず</label>
          <div class="col-xs-6">
            <input type="number" min="1" id="countOfQuestions" v-model="countOfQuestions" max="100" class="form-control form-control-lg" />
          </div>
          <label class="col-xs-6 col-form-label col-form-label-lg">もん</label>
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-xs">
        <router-link v-bind:to="{ name: 'Playing', params: { countOfQuestions: countOfQuestions } }" class="btn btn-lg btn-primary pl-5 pr-5">はじめる</router-link>
      </div>
    </div>

    <hr />

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
    return {
    }
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

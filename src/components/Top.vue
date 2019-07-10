<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h2>なんもんせいかいできるかな？</h2>
        <p>もんだいのかずをえらんだら「はじめる」ボタンをおしてね。</p>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-xs-12">
        <div class="form-group row">
          <label class="col-xs-4 col-form-label col-form-label-lg">もんだいのかず</label>
          <div class="col-xs-4">
            <input
              type="number"
              min="1"
              name="countOfQuestions"
              v-model="countOfQuestions"
              max="100"
              class="form-control form-control-lg"
              v-validate="'required|numeric|min:1|max:100'"
              data-vv-as="もんだいのかず"
              />
          </div>
          <label class="col-xs-4 col-form-label col-form-label-lg">もん</label>
        </div>
      </div>

      <div class="col-xs-12">
        <span class="text-danger">{{ errors.first('countOfQuestions') }}</span>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-xs">
        <button @click="startGame" class="btn btn-lg btn-primary pl-5 pr-5">はじめる</button>
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
        this.$store.commit('updateCountOfQuestions', value)
      }
    }
  },
  methods: {
    startGame () {
      this.$validator.validate().then(result => {
        if (!result) {
          return false
        }

        this.$router.push(
          {
            path: `/playing/${this.countOfQuestions}`
          }
        )
      })
    }
  }
}
</script>

<style scoped>
.intro {
  font-size: 160%;
}
</style>

<template>
  <div>
    <div class="row">
      <div class="col-auto">
        <h2>なんもんせいかいできるかな？</h2>
        <p>もんだいのかずをえらんだら「はじめる」ボタンをおしてね。</p>
      </div>
    </div>

    <Form @submit="startGame" v-slot="{ errors }">
      <div class="row justify-content-center">
        <div class="col-xs-12">
          <div class="form-group row">
            <label class="col-xs-4 col-form-label col-form-label-lg"
              >もんだいのかず</label
            >
            <div class="col-xs-4">
              <Field
                name="countOfQuestions"
                :rules="validateCount"
                v-model.number="countOfQuestions"
                type="number"
                min="1"
                max="100"
                class="form-control form-control-lg"
              />
            </div>
            <label class="col-xs-4 col-form-label col-form-label-lg"
              >もん</label
            >
          </div>
        </div>

        <div class="col-xs-12">
          <span class="text-danger">{{ errors.countOfQuestions }}</span>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-xs">
          <button type="submit" class="btn btn-lg btn-primary pl-5 pr-5">
            はじめる
          </button>
        </div>
      </div>
    </Form>

    <div class="row justify-content-center mt-4">
      <div class="col-xs">
        <router-link
          to="/daily-challenge"
          class="btn btn-lg btn-warning pl-5 pr-5 mr-2"
        >
          📅 デイリーチャレンジ
        </router-link>
        <router-link
          to="/time-attack"
          class="btn btn-lg btn-success pl-5 pr-5 mr-2"
        >
          ⏱️ タイムアタックモード
        </router-link>
        <router-link
          to="/ai-battle"
          class="btn btn-lg btn-danger pl-5 pr-5 mr-2"
        >
          🤖 AI対戦モード
        </router-link>
        <router-link
          to="/collection"
          class="btn btn-lg btn-primary pl-5 pr-5 mr-2"
        >
          📚 コレクション図鑑
        </router-link>
        <router-link to="/badges" class="btn btn-lg btn-warning pl-5 pr-5">
          🎖️ バッジコレクション
        </router-link>
        <p class="text-muted mt-2">
          毎日5問のチャレンジで連続記録を目指そう！100首全てを制限時間内にクリアしよう！AIと対戦してスキルを競おう！おぼえた歌を図鑑で確認しよう！バッジを集めよう！
        </p>
      </div>
    </div>

    <hr />

    <div class="row justify-content-center">
      <div class="col-auto text-center">
        <img
          src="@/assets/hyakunin_issyu.png"
          class="img-fluid w-75 center-block"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Form, Field } from 'vee-validate';

export default {
  components: { Form, Field },
  computed: {
    countOfQuestions: {
      get() {
        return this.$store.state.countOfQuestions;
      },
      set(value) {
        this.$store.commit('updateCountOfQuestions', value);
      },
    },
  },
  methods: {
    validateCount(value) {
      if (value === '' || value === null || value === undefined) {
        return 'もんだいのかずは必須です';
      }
      const n = Number(value);
      if (!Number.isFinite(n)) {
        return 'もんだいのかずは数値で入力してください';
      }
      if (!Number.isInteger(n)) {
        return 'もんだいのかずは整数で入力してください';
      }
      if (n < 1) {
        return 'もんだいのかずは1以上で入力してください';
      }
      if (n > 100) {
        return 'もんだいのかずは100以下で入力してください';
      }
      return true;
    },
    startGame() {
      this.$router.push({ path: `/playing/${this.countOfQuestions}` });
    },
  },
};
</script>

<style scoped>
.intro {
  font-size: 160%;
}
</style>

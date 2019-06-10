<template>
  <div class="signin">
    <h2>ログイン</h2>
    <input type="text" placeholder="Username" v-model="username">
    <input type="password" placeholder="Password" v-model="password">
    <button @click="signIn" class="btn btn-primary btn-lg">ログインする</button>
    <p>
      <router-link to="/signup">しんきとうろくはこちら</router-link>
    </p>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Signin',
  data: function () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    signIn: function () {
      firebase.auth().signInWithEmailAndPassword(this.username, this.password).then(
        user => {
          this.$router.push('/')
        },
        error => {
          let message = error.message
          switch (error.code) {
            case 'auth/user-not-found':
              message = 'このメールアドレスに対応するユーザが見つかりません。ユーザーが削除された可能性があります。'
              break
            default:
              console.log(error.code)
              console.log(error.message)
              break
          }
          alert(message)
        }
      )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.signin {
  margin-top: 20px;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center
}
input {
  margin: 10px 0;
  padding: 10px;
}
</style>

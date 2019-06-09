<template>
  <div class="signup">
    <h2>しんきとうろく</h2>
    <input type="text" placeholder="Username" v-model="username">
    <input type="password" placeholder="Password" v-model="password">
    <button @click="signUp">しんきとうろくする</button>
    <p>
      <router-link to="/signin">しんきとうろくずみのかたはこちら</router-link>
    </p>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'SignUp',
  data () {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    signUp: function () {
      firebase.auth().createUserWithEmailAndPassword(this.username, this.password)
        .then(user => {
          this.$router.push('/signIn')
        })
        .catch(error => {
          let message = error.message
          switch (error.code) {
            case 'auth/email-already-in-use':
              message = 'メールアドレスは既に別のアカウントで使用されています。'
              break
            case 'auth/invalid-email':
              message = 'メールアドレスの形式が正しくありません。'
              break
            case 'auth/weak-password':
              message = 'パスワードは6文字以上にしてください。'
              break
            default:
              console.log(error.code)
              console.log(error.message)
              break
          }
          alert(message)
        })
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
.signup {
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

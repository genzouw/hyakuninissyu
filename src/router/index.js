import Vue from 'vue'
import Router from 'vue-router'
import Top from '@/components/Top'
import Playing from '@/components/Playing'
import GameSet from '@/components/GameSet'
import SignUp from '@/components/SignUp'
import SignIn from '@/components/SignIn'
// import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'top',
      component: Top
    },
    {
      path: '/playing/:countOfQuestions',
      name: 'Playing',
      component: Playing
    },
    {
      path: '/gameSet/:countOfQuestions/:score',
      name: 'GameSet',
      component: GameSet
    },
    {
      path: '/signUp',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/signIn',
      name: 'SignIn',
      component: SignIn
    }
  ]
})

/*
router.beforeEach((to, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        next()
      } else {
        next({
          path: '/signUp',
          query: { redirect: to.fullPath }
        })
      }
    })
  } else {
    next()
  }
})
*/

export default router

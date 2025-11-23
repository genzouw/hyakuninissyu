import Vue from 'vue'
import Router from 'vue-router'
import Top from '@/components/Top'
import Playing from '@/components/Playing'
import GameSet from '@/components/GameSet'
import SignUp from '@/components/SignUp'
import SignIn from '@/components/SignIn'
import Profile from '@/components/Profile'
import TimeAttack from '@/components/TimeAttack'
import TimeAttackResult from '@/components/TimeAttackResult'

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
      path: '/time-attack',
      name: 'TimeAttack',
      component: TimeAttack
    },
    {
      path: '/time-attack-result/:timeMs/:score',
      name: 'TimeAttackResult',
      component: TimeAttackResult
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
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
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

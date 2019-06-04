import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Playing from '@/components/Playing'
import GameSet from '@/components/GameSet'
import SignUp from '@/components/SignUp'
import SignIn from '@/components/SignIn'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
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

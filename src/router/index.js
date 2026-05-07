import Vue from 'vue'
import Router from 'vue-router'
import Top from '@/components/Top'
import Playing from '@/components/Playing'
import GameSet from '@/components/GameSet'
import TimeAttack from '@/components/TimeAttack'
import TimeAttackResult from '@/components/TimeAttackResult'
import AIBattle from '@/components/AIBattle'
import AIBattleResult from '@/components/AIBattleResult'
import Badges from '@/components/Badges'
import Collection from '@/components/Collection'
import DailyChallenge from '@/components/DailyChallenge'
import DailyChallengeResult from '@/components/DailyChallengeResult'

Vue.use(Router)

const router = new Router({
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
      path: '/ai-battle',
      name: 'AIBattle',
      component: AIBattle
    },
    {
      path: '/ai-battle-result/:playerScore/:aiScore/:totalQuestions/:difficulty',
      name: 'AIBattleResult',
      component: AIBattleResult
    },
    {
      path: '/badges',
      name: 'Badges',
      component: Badges
    },
    {
      path: '/collection',
      name: 'Collection',
      component: Collection
    },
    {
      path: '/daily-challenge',
      name: 'DailyChallenge',
      component: DailyChallenge
    },
    {
      path: '/daily-challenge-result/:score/:streak/:previousStreak',
      name: 'DailyChallengeResult',
      component: DailyChallengeResult
    }
  ]
})

export default router

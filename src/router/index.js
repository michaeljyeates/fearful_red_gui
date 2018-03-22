import Vue from 'vue'
import Router from 'vue-router'
import PollList from '@/components/PollList'
import PollForm from '@/components/PollForm'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/poll',
      name: 'Poll List',
      component: PollList
    },
    {
      path: '/poll/:poll_id',
      name: 'Poll Form',
      component: PollForm
    }
  ]
})

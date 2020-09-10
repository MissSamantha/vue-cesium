import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import car from '@/components/car'
import sampleStart from '@/components/sampleStart'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/car',
      name: 'car',
      component: car
    },
    {
      path: '/sampleStart',
      name: 'sampleStart',
      component: sampleStart
    }
  ]
})

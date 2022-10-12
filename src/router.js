import Vue from 'vue'
import VueRouter from 'vue-router'
import Foo from './components/Foo.vue'
import Bar from './components/Bar.vue'

Vue.use(VueRouter)

export default () => {
  const createRouter = new VueRouter({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Foo
      },
      {
        path: '/bar',
        component: Bar
      }
    ]
  })
  return createRouter
}
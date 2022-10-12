import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'


export default () => {
  const router = createRouter()
  const app = new Vue({
    render: h => h(App),
    router
  })
  return { app, router }
}
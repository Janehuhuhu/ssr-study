import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default () => {
  const store = new Vuex.Store({
    state: {
      name: ''
    },
    mutations: {
      changeName(state) {
        state.name = '你好，我是vuex'
      }
    },
    actions: {
      changeName({ commit }) {
        return new Promise((resolve) => {
          setTimeout(() => {
            commit('changeName')
            resolve()
          }, 1000)
        })
      }
    }
  })
  return store
}
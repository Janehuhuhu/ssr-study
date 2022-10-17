## ssr 集成 vuex
### 1. vuex 配置

#### 1.1 vuex 实例
```js
// store.js
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
          }, 2000)
        })
      }
    }
  })
  return store
}
```
```js
// 入口 main.js
import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'
import createStore from './store'

export default () => {
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    router,
    store,
    render: h => h(App),
  })
  return { app, router, store }
}
```
<br>

#### 1.2 服务端使用
- `matchs` 匹配到所有的组件，整个都在服务端执行 `vuex` 中的方法 `asyncData`(该名字可自定义)
  ```js
  // Foo.vue 组件
  <script>
    export default {
      // 只在服务端执行，并且只在页面组件中执行
      asyncData(store) {
        console.log('server')
        return store.dispatch('changeName')
      },
    };
    </script>
  ```

- 执行逻辑 `context.state = store.state` 会插入如下代码（页面查看源代码即可看见）
  ```js
  <script>window.__INITIAL_STATE__={"name":"初始值"}</script>
  ```

```js
// 服务端入口 server-entry.js
import CreateApp from './main'
export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = CreateApp()
    router.push(context.url)
    // 涉及到异步组件的问题
    // 等路由跳转结束和异步组件加载完成后再返回结果
    router.onReady(() => {
      // 获取当前跳转到的路由匹配的组件
      const matchs = router.getMatchedComponents()
      // matchs匹配到所有的组件，整个都在服务端执行
      Promise.all(matchs.map(component => {
        if (component.asyncData) {
          return component.asyncData(store)
        }
      })).then(() => {
        // promise.all 中逻辑会改变state
        // 执行如下逻辑代码中会插入<script>window.__INITIAL_STATE__={"name":"初始值"}</script>
        context.state = store.state
        // 路由不存在时的处理
        !matchs.length && reject({ code: 404 })
        resolve(app)
      })
    }, reject)
  })
}
```

<br>
<br>

### 2. 服务端最新状态替换客户端状态
- 上述 `window.__INITIAL_STATE__` 服务端更新的状态需要同步到客户端
- 客户端切换路由的时候vuex状态丢失（asynData和mounted需同时存在）, 暂未复现该问题
```js
// store.js
// 如果浏览器执行的时候，需要将服务端状态替换掉客户端状态
if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
```
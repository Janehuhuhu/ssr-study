## ssr 集成路由系统

### 1. 路由配置
#### 1.1 vue-router 实例
```js
// router.js
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
        path: '/index',
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
```

```js
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
- 启动服务器后，访问 `http://localhost:3000/index` 即可
- 路径访问规则
  - `static` 配置默认是相对于服务启动的路径
  - 先访问路径 `/`，`send` 已经结束，不会走后面的本地静态资源读取服务( `index-ssr.html` 中的 `client.bundle.js`)，所以用 `/index` 代替 `/`, 避免静态资源地址读取又走到路径 `/` 中
  - `static` 访问放在路径访问之后, 根据实际情况放置。比如读取首页时，`static` 建议放置在路径后，避免进入本地静态资源访问地址(`static` 放置在后面，`localhost:3000` 会先访问服务器，如果将 `static` 放在前面，则会默认读取本地静态资源的 `index.html` 文件)。
  - `static` 访问本地静态资源一般需要带后缀，如 `localhost:3000/index.html`，`localhost:3000/index` 走的是路由

```js
// 首页访问，不能用 /，会导致静态资源也访问到这里，无法正确读取到正确的静态资源
server.use('/index', async (req, res) => {
  const str = await new Promise((resolve, reject) => {
    serverRender.renderToString({ url: '/index' }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
  res.send(str)
})

// 放在路径访问后面，避免先访问静态资源地址dist/index
server.use(express.static('dist'))
```

<br>
<br>

### 2. 自动首页跳转
访问页面时，发现首页路由下的内容没有显示，因为服务端不知道渲染哪个页面，则需要进行如下配置：
```js
// 服务端入口 server-entry.js
export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = CreateApp()
    router.push(context.url) // 渲染当前页面
    return app
  })
}
```

```js
// 服务端 server.js
// 通过 { url: '/index' } 将访问路径信息传递给上面服务端入口
server.use('/index', async (req, res) => {
  const str = await new Promise((resolve, reject) => {
    serverRender.renderToString({ url: '/index' }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
  res.send(str)
})
```
<br>
<br>

### 3. 其他路由页面刷新找不到资源
刷新 `localhost:3000/bar` 页面找不到资源，因为刷新走的是服务端渲染，会找不到路径，需走如下配置，配置后会走服务端入口的 `router.push(context.url)` 访问对应路由
```js
// 服务端 server.js
// 如果匹配不到已有资源，会执行此逻辑
// 如果服务器没有路径，会渲染当前 App.vue, 即执行里面的 router.push找到对应路径
// 按照路由刷新页面时会走到这里
server.use(async (req, res) => {
  const str = await new Promise((resolve, reject) => {
    serverRender.renderToString({ url: req.url }, (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    })
  })
  res.send(str)
})
```

<br>
<br>

### 4. 异步返回服务端实例
可能涉及到异步组件，所以用 `router.onReady` 等路由跳转结束和异步组件加载完成后再返回结果
```js
export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = CreateApp()
    router.push(context.url)
    // 涉及到异步组件的问题
    // 等路由跳转结束和异步组件加载完成后再返回结果
    router.onReady(() => {
        resolve(app)
    }, reject)
  })
}
```
<br>
<br>

### 5. 路由不存在时处理
如访问 `localhost:3000/aaaa` 不存在的路径需要有兜底
```js
export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = CreateApp()
    router.push(context.url)
    router.onReady(() => {
      // 获取当前跳转到的路由匹配的组件
      const matchs = router.getMatchedComponents()
        // 路由不存在时的处理
        !matchs.length && reject({ code: 404 })
        resolve(app)
    }, reject)
  })
}
```
```js
// 服务端 server.js
// 如果匹配不到已有资源，会执行此逻辑
// 如果服务器没有路径，会渲染当前 App.vue, 即执行里面的 router.push找到对应路径
// 按照路由刷新页面时会走到这里
server.use(async (req, res) => {
  try {
    const str = await new Promise((resolve, reject) => {
      serverRender.renderToString({ url: req.url }, (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
    res.send(str)
  } catch(e) {
    res.send('404')
  }
})
```
<br>
<br>

### 6. vue ssr 中的路由跳转规则
首次渲染走的时服务端渲染，切换路由时走的时客户端渲染

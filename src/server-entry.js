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

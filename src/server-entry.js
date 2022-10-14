import CreateApp from './main'


export default (context) => {
  return new Promise((resolve, reject) => {
    const { app, router } = CreateApp()
    router.push(context.url)
    // 涉及到异步组件的问题
    // 等路由跳转结束和异步组件加载完成后再返回结果
    router.onReady(() => {
      // 获取当前跳转到的路由匹配的组件
      const matchs = router.getMatchedComponents()
      // 路由不存在时的处理
      !matchs.length && reject({ code: 404 })
      resolve(app)
    }, reject)
  })
}

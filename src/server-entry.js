import CreateApp from './main'


export default (context) => {
  const { app, router } = CreateApp()
  router.push(context.url)
  return app
}

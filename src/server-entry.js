import CreateApp from './main'


export default () => {
  const { app, router } = CreateApp()
  router.push('/index')
  return app
}

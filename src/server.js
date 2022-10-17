const express = require('express')
const VueServerRender = require('vue-server-renderer')
const path = require('path')
const fs = require('fs')

const server = express()
// const serverBundle = fs.readFileSync(path.resolve(__dirname, './dist/server.bundle.js'), 'utf8')
const serverBundle = require('../dist/vue-ssr-server-bundle.json')
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index-ssr.html'), 'utf8')

// 客户端manifest.json
const clientManifest = require('../dist/vue-ssr-client-manifest.json')

const serverRender = VueServerRender.createBundleRenderer(serverBundle, {
  template,
  clientManifest // 渲染的时候可以找到客户端的js文件，自动引入到html
})


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

// 放此位置也可
// server.use(express.static('dist'))

server.listen(3000)
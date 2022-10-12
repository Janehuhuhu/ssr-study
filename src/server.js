const express = require('express')
const serveStatic = require('serve-static')

const Vue = require('vue')
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

// const vm = new Vue({
//   data() {
//     return { msg: '我是一条消息' }
//   },
//   template: `<div>{{msg}}</div>`
// })

// server.use('/index.html', async (req, res) => {
//   const str = await new Promise((resolve, reject) => {
//     serverRender.renderToString((err, data) => {
//       if (err) {
//         reject(err)
//       }
//       resolve(data)
//     })
//   })
//   res.send(str)
// })
console.log('***', path.join(__dirname, '../dist'))
// server.use(express.static(path.join(__dirname, '../dist')))
server.use(express.static('dist'))

server.listen(3000)
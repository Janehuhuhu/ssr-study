const express = require('express')
const Vue = require('vue')
const VueServerRender = require('vue-server-renderer')
const path = require('path')
const fs = require('fs')

const server = express()
const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8')
const serverRender = VueServerRender.createRenderer({
  template
})

const vm = new Vue({
  data() {
    return { msg: '我是一条消息' }
  },
  template: `<div>{{msg}}</div>`
})

server.use('/', async (req, res) => {
  const str = await serverRender.renderToString(vm)
  res.send(str)
})

server.listen(3000)
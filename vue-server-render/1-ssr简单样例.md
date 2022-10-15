## vue-server-render
主要思想是通过 `vue-server-renderer` 创建渲染器，然后通过渲染器将 `vue` 实例代码转换为 `html` 字符串，将字符串通过服务器返回给浏览器，即可在浏览器端看到效果

```js
const VueServerRender = require('vue-server-renderer')
const serverRender = VueServerRender.createRenderer({
  template
})
serverRender.renderToString(vm)
```

执行前：
```js
const vm = new Vue({
  data() {
    return { msg: '我是一条消息' }
  },
  template: `<div>{{msg}}</div>`
})
```
执行后：
```js
<div data-server-rendered="true">我是一条消息</div>
```
<br>
<br>

完整示例代码：
```js
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
```

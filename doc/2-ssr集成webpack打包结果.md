## ssr 集成 webapack 打包结果

### 1. webpack 配置

#### 1.1 基础配置
```js
const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'development',
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,  // .LICENSE.txt 为注释文件
    })],
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: 'vue-style-loader', //MiniCssExtractPlugin.loader,
          // options: {
          //   esModule: false,
          // },
        }, 'css-loader']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          },
        },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    // new MiniCssExtractPlugin(),
  ]
}
```
<br>

#### 1.2 客户端配置
```js
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const ClientRenderPlugin = require('vue-server-renderer/client-plugin')

module.exports = merge(baseConfig, {
  entry: {
    client: path.resolve(__dirname, '../src/client-entry')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
  },
  mode: 'development',
  plugins: [
    new ClientRenderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ]
})
```
<br>

#### 1.3 服务端配置
- 打包结果是 `modules.exports` 的形式，所以 `output` 配置用 `libraryTarget: commonjs2`, 因为在服务端启动代码中需要用 `require` 方式引入服务端打包结果
  ```js
  const serverBundle = require('../dist/vue-ssr-server-bundle.json')
  const serverRender = VueServerRender.createBundleRenderer(serverBundle, {
    template,
    clientManifest // 渲染的时候可以找到客户端的js文件，自动引入到html
  })
  ```
- `index-ssr.html` 中不需要引入 `server.bundle.js` ，所以需要以下配置
  ```js
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, '../public/index-ssr.html'),
    filename: 'index-ssr.html',
    excludeChunks: ['server']
  }),
  ```
- 服务端打包结果要给 `node` 使用，需要配置 `target: 'node'`

  ```js
  const HtmlWebpackPlugin = require('html-webpack-plugin')
  const ServerRenderPlugin = require('vue-server-renderer/server-plugin')
  const { merge } = require('webpack-merge')
  const path = require('path')
  const baseConfig = require('./webpack.base')

  module.exports = merge(baseConfig, {
    entry: {
      server: path.resolve(__dirname, '../src/server-entry.js')
    },
    output: {
      path: path.resolve(__dirname, '../dist'),
      libraryTarget: 'commonjs2',
      filename: '[name].bundle.js'
    },
    target: 'node', // 要给node使用
    plugins: [
      new ServerRenderPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index-ssr.html'),
        filename: 'index-ssr.html',
        excludeChunks: ['server']
      }),
    ]
  })
  ```
<br>
<br>


### 2. 打包
#### 2.1 要点
- 执行以下命令分别打包客户端代码和服务端代码，客户端打包生成 `client.bundle.js`、`index.html`、`vue-ssr-client-manifest.json` 文件，其中 `vue-ssr-client-manifest.json` 可以在服务端渲染的时候可以找到客户端的 `js` 文件，自动引入到 `index-ssr.html` 中。
- 服务端打包生成 `index-ssr.html` 和 `vue-ssr-server-bundle.json`, 前者的 `body` 标签中需要包含 `<!--vue-ssr-outlet-->`(当前时手动引入，可能哪里出了问题，每次打包后注释会丢失)。后者包含服务端打包结果 `server.bundle.js`

<br>

#### 2.2 命令
- 以下命令可以监听文件变化重新编译 *-- --watch*
  ```js
  "client:build": "webpack --config ./build/webpack.client.js --mode production",
  "server:build": "webpack --config ./build/webpack.server.js --mode production"
  yarn client:build -- --watch
  yarn server:build -- --watch
  ```
<br>
<br>

### 3. 服务端启动
- `serverRender.renderToString` 使用回调
  ```js
  const express = require('express')
  const VueServerRender = require('vue-server-renderer')
  const path = require('path')
  const fs = require('fs')

  const server = express()
  const serverBundle = require('../dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync(path.resolve(__dirname, '../dist/index-ssr.html'), 'utf8')

  // 客户端manifest.json
  const clientManifest = require('../dist/vue-ssr-client-manifest.json')

  const serverRender = VueServerRender.createBundleRenderer(serverBundle, {
    template,
    clientManifest // 渲染的时候可以找到客户端的js文件，自动引入到html
  })

  server.use('/', async (req, res) => {
    const str = await new Promise((resolve, reject) => {
      serverRender.renderToString((err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
    res.send(str)
  })

  server.listen(3000)
  ```
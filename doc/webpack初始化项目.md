## webpack 初始化项目
### 1. 安装依赖
```js
yarn add webpack webpack-cli webpack-dev-server vue vue-loader vue-template-compiler style-loader css-loader @babel/core babel-loader @babel/preset-env html-webpack-plugin
```
注意点：
- `vue`、`vue-loader`、`vue-template-compiler` 需配套使用，注意 `vue-template-compiler` 和 `vue` 版本需保持一致（如用 `vue-server-renderer` 版本也需要保持一致），这里选择的版本是 *2.6.11*, `vue-loader` 选择 *15.9.0*

<br>
<br>

### 2. webpack 配置
#### 2.1 vue-loader
`vue-loader` 将解析文件，提取每个语言块，如有必要，将它们通过其他加载器进行管道传输，最后将它们组装回 `ES` 模块，其默认导出为 `Vue.js` 组件选项对象
- Template：每个 `*.vue.` 文件一次最多可以包含一个 `<template>` 块；内容将被提取并传递给 vue-template-compiler 并预编译为 JavaScript 渲染函数，最后注入 `<script>` 部分的导出组件中
- Script： 每个 `*.vue.` 文件一次最多可以包含一个 `<script>` 块；任何针对 `.js` 文件的 `webpack rules` 都将应用于 `<script>` 块中的内容
- Style： 默认匹配 `/\.css$/`；可以包含多个 `<style>` 块；可以包含 `Scoped` 或者 `module` 属性；任何针对 `.css` 文件的 `webpack rules` 都将应用于 `<style>` 块中的内容
详见 [vue-loader&vue-template-compiler详解](https://zhuanlan.zhihu.com/p/114239056)
<br>

#### 2.2 vue-template-compiler
该模块可用于将 `Vue` 模板预编译为渲染函数（template => ast => render），以避免运行时编译开销和 `CSP` 限制
```js
const compiler = require('vue-template-compiler')
const result = compiler.compile(`
  <div id="test">
    <div>
      <p>This is my vue render test</p>
    </div>
    <p>my name is {{myName}}</p>
  </div>`
)
```

编译结果：
```js
{
  ast: ASTElement, // 解析模板生成的ast
  render: string,    // 渲染函数
  staticRenderFns: Array<string>, // 静态子树
  errors: Array<string>,
  tips: Array<string>
}
```
<br>


#### 2.3 vue 文件打包
`VueLoaderPlugin` 插件是必须的，它的职责是将你定义过的其它规则复制并应用到 `.vue` 文件里相应语言的块。例如，如果你有一条匹配 `/\.js$/` 的规则，那么它会应用到 `.vue` 文件里的 `<script>` 块。[详见](https://vue-loader.vuejs.org/zh/guide/#%E6%89%8B%E5%8A%A8%E8%AE%BE%E7%BD%AE)
```js
const { VueLoaderPlugin } = require('vue-loader')
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
    ]
  }
  plugins: [
    new VueLoaderPlugin()
  ]
}
```


<br>
<br>

完整配置：
```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const path = require('path')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new VueLoaderPlugin()
  ]
}
```




静态资源无法访问
- static 默认是相对于服务启动的路径
- 先访问路径/，send 已经结束，不会走后面的静态资源读取服务，所以用/index代替/, 避免静态资源地址读取又走到路径/中
- static 访问放在路径访问之后

https://blog.csdn.net/m0_55980331/article/details/116027871
https://blog.csdn.net/qq_34425377/article/details/120966667
https://blog.csdn.net/intrwins/article/details/125384393


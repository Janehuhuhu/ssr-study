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
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    filename: '[name].bundle.js'
  },
  target: 'node', // 要给node使用
  plugins: [
    // new ServerRenderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index-ssr.html'),
      filename: 'index-ssr.html',
      excludeChunks: ['server']
    }),
  ]
})
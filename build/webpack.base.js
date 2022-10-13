const { VueLoaderPlugin } = require('vue-loader')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const { CleanWebpackPlugin } = require('clean-webpack-plugin')

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
  // output: {
  //   publicPath: 'static'
  // },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{
          loader: 'vue-style-loader',//MiniCssExtractPlugin.loader,
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
    // new CleanWebpackPlugin()
  ]
}
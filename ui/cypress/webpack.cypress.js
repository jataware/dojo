const webpack = require('webpack');
const path = require('path');

const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: ['babel-polyfill', path.resolve(__dirname, './client/index.js')],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[contenthash].bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|.jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
        sideEffects: true
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg|mp4)$/,
        loader: 'file-loader',
      },
    ]
  },

  devtool: 'source-map',
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },

  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    port: 8080,
    historyApiFallback: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    proxy: {
      '/api/terminal': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api/terminal': '' },
        secure: false,
        changeOrigin: true,
      },
      '/api/ws': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      '/api/dojo': {
        target: 'http://localhost:8000',
        pathRewrite: { '^/api/dojo': '' },
        secure: false,
        changeOrigin: true,
      },
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: "[contenthash].css",}),
    new CopyWebpackPlugin({
      patterns: [
        { from: "client/assets", to: "assets" }
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
    }),
  ],
};

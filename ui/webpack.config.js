
const webpack = require('webpack');
const path = require('path');

const NodemonPlugin = require('nodemon-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', path.resolve(__dirname, './client/index.js')],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
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
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10000
                    }
                }]
            }
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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api': '' },
        secure: false,
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:3000',
        secure: false,
        changeOrigin: true,
        ws: true,
      },
      '/dojo': {
        target: 'http://localhost:8000',
        secure: false,
        changeOrigin: true,
      },
    }
  },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        //new ESLintPlugin(),
        new HtmlWebpackPlugin({
            template: 'client/index.html',
            favicon: 'client/favicon.ico',
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",}),
        new webpack.HotModuleReplacementPlugin()
    ],
};

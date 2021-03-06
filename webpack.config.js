'use strict'

const BUILD_DIR = 'build'
const CWD = process.cwd()
const ENV = process.env.NODE_ENV || 'development'
const PKG = require('./package.json')
const PRODUCTION = ENV === 'production'

const _ = require('lodash')
const path = require('path')
const src = path.resolve(CWD, 'src')
const webpack = require('webpack')
const WebpackCleanPlugin = require('clean-webpack-plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const WebpackExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackHTMLPlugin = require('html-webpack-plugin')
const WebpackStatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin
const WebpackZipPlugin = require('zip-webpack-plugin')

const CDN_NAME = `${_.snakeCase(PKG.name)}_content`
const ZIP_FILE = `${PKG.name}.zip`

const fileLoader = (extras) => `file?limit=1000&name=/content/${CDN_NAME}/[name].[ext]${extras || ''}`

let config = {
  context: src,
  cache: false,
  entry: {
    [`content/${CDN_NAME}/app.css`]: './scss/app',
    [`content/${CDN_NAME}/app.js`]: ['jquery', 'bootstrap', './js/app'],
    [`${PKG.name}.js`]: './js/workbench'
  },
  output: {
    name: PKG.name,
    filename: '[name]',
    publicPath: '',
    path: path.resolve(CWD, BUILD_DIR),
    libraryTarget: 'amd'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [{
      test: /\.(ttf|eot|woff2?)/,
      loader: fileLoader()
    }, {
      test: /\.(jpg|png|gif|svg)/,
      loader: fileLoader('!img?progressive=true')
    }, {
      test: /\.pug$/,
      loader: 'pug',
      query: {
        pretty: !PRODUCTION
      }
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.js?$/,
      exclude: [
        /node_modules/
      ],
      loader: 'babel?compact=false'
    }, {
      test: /\.scss$/,
      loader: WebpackExtractTextPlugin.extract('style', 'css!sass')
    }]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.scss', '.pug', '.jpg', '.png', '.gif', '.svg'],
    alias: {
      img: `${src}/img/`,
      pug: `${src}/pug/`
    }
  },
  externals: [
    'angular',
    'jquery',
    'js/qlik'
  ],
  plugins: [
    new WebpackCleanPlugin([BUILD_DIR]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new WebpackExtractTextPlugin('[name]'),
    new WebpackHTMLPlugin({
      inject: false,
      hash: true,
      filename: `${PKG.name}.html`,
      template: 'pug/index',
      title: PKG.name,
      production: PRODUCTION,
      app: {
        css: `content/${CDN_NAME}/app.css`,
        js: `content/${CDN_NAME}/app.js`
      },
      wrapper: `${PKG.name}.js`
    }),
    new WebpackCopyPlugin([{
      from: '../qlik/template.qext',
      to: `${PKG.name}.qext`
    }, {
      from: '../qlik/preview.png'
    }])
  ]
}

if (PRODUCTION) {
  const exclude = [
    /^\..*/,
    /\.zip/,
    /content\//,
    /resources\//
  ]

  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      mangle: false
    }),
    new WebpackStatsWriterPlugin({
      filename: 'wbfolder.wbl',
      fields: null,
      transform: (stats, opts) =>
        stats.assets
          .filter(({ name }) => !exclude.some((regex) => regex.test(name)))
          .map(({ name }) => name).join(';\n')
    }),
    new WebpackZipPlugin({
      filename: ZIP_FILE,
      pathPrefix: PKG.name,
      exclude
    })
  )

  config.devtool = null
} else {
  config.plugins.push(
    new WebpackCopyPlugin([{
      from: '../qlik/qlik-styles.css',
      to: 'resources/css/qlik-styles.css'
    }, {
      from: '../qlik/qlikui.css',
      to: 'resources/css/qlikui.css'
    }, {
      from: '../qlik/client.css',
      to: 'resources/css/client.css'
    }, {
      from: '../qlik/qlik.js',
      to: 'resources/js/qlik.js'
    }, {
      from: '../qlik/require.js',
      to: 'resources/assets/external/requirejs/require.js'
    }, {
      from: '../qlik/OpenLayers.js',
      to: 'resources/assets/external/openlayers/OpenLayers.js'
    }, {
      from: '../qlik/product-info.js',
      to: 'resources/autogenerated/product-info.js'
    }, {
      from: '../qlik/common.js',
      to: 'resources/translate/en-US/common.js'
    }, {
      from: '../qlik/client.js',
      to: 'resources/translate/en-US/client.js'
    }, {
      from: '../node_modules/jquery/dist/jquery.js',
      to: 'resources/jquery.js'
    }])
  )
}

module.exports = config

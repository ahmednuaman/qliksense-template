'use strict'

const BUILD_DIR = 'build'
const CWD = process.cwd()
const ENV = process.env.NODE_ENV || 'development'
const PKG = require('./package.json')
const PRODUCTION = ENV === 'production'
const ZIP_FILE = `${PKG.name}.zip`

const path = require('path')
const src = path.resolve(CWD, 'src')
const webpack = require('webpack')
const WebpackCleanPlugin = require('clean-webpack-plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const WebpackExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackHTMLPlugin = require('html-webpack-plugin')
const WebpackStatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin
const WebpackZipPlugin = require('zip-webpack-plugin')

let config = {
  context: src,
  cache: true,
  entry: {
    'asset/css/app.css': './scss/app',
    [`${PKG.name}.js`]: './js/app'
  },
  output: {
    filename: '[name]',
    publicPath: '',
    path: path.resolve(CWD, BUILD_DIR)
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [{
      test: /\.woff2?/,
      loader: 'url?mimetype=application/font-woff&name=asset/font/[name].[ext]?[hash]'
    }, {
      test: /\.ttf/,
      loader: 'url?mimetype=application/octet-stream&name=asset/font/[name].[ext]?[hash]'
    }, {
      test: /\.eot/,
      loader: 'url?mimetype=application/vnd.ms-fontobject&name=asset/font/[name].[ext]?[hash]'
    }, {
      test: /\.svg/,
      loader: 'url?mimetype=image/svg+xml&name=asset/font/[name].[ext]?[hash]'
    }, {
      test: /img\/.+\.(jpg|png|gif|svg)$/,
      loader: 'url?limit=1000&name=asset/img/[name].[ext]?[hash]!img?progressive=true'
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
      loader: 'babel',
      query: {
        compact: false
      }
    }, {
      test: /\.scss$/,
      loader: WebpackExtractTextPlugin.extract('style', 'css!sass')
    }]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.scss', '.pug', '.jpg', '.png', '.gif', '.svg'],
    alias: {
      img: `${src}/img/`,
      'js/qlik': `${src}/qlik/qlik`
    }
  },
  externals: [{
    'angular': true,
    'jquery': true,
    'qlik': true
  }],
  plugins: [
    new WebpackCleanPlugin([BUILD_DIR, ZIP_FILE]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new WebpackExtractTextPlugin('[name]', {
      allChunks: true
    }),
    new WebpackHTMLPlugin({
      inject: false,
      hash: true,
      filename: `${PKG.name}.html`,
      template: 'pug/index',
      title: PKG.name,
      production: PRODUCTION,
      js: `${PKG.name}.js`
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
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new WebpackStatsWriterPlugin({
      filename: 'wbfolder.wbl',
      fields: null,
      transform: (stats, opts) => stats.assets.map(({ name }) => name).join(';\n')
    }),
    new WebpackZipPlugin({
      filename: ZIP_FILE,
      pathPrefix: PKG.name,
      exclude: /^\..*/
    })
  )

  config.devtool = null
} else {
  config.plugins.push(
    new WebpackCopyPlugin([{
      from: '../qlik/qlik-styles.css',
      to: 'asset/css/qlik-styles.css'
    }, {
      from: '../qlik/qlik.js',
      to: 'asset/js/qlik.js'
    }])
  )
}

module.exports = config

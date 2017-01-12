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
    [`${PKG.name}.css`]: './scss/app',
    [`${PKG.name}.js`]: './js/app'
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
      test: /\.woff2?$/,
      loader: 'file',
      query: {
        limit: 1000,
        mimetype: 'application/font-woff',
        name: '[name].[ext]'
      }
    }, {
      test: /img\/.+\.(jpg|png|gif|svg)$/,
      loader: 'file!img',
      query: {
        limit: 1000,
        progressive: true,
        name: '[name].[ext]'
      }
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
      img: `${src}/img/`
    }
  },
  externals: [{
    'angular': {
      amd: 'angular'
    },
    'jquery': {
      amd: 'jquery'
    },
    'js/qlik': {
      amd: '/resources/js/qlik.js'
    }
  }],
  plugins: [
    new WebpackCleanPlugin([BUILD_DIR, ZIP_FILE]),
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
      css: `${PKG.name}.css`,
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
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }),
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
    }])
  )
}

module.exports = config

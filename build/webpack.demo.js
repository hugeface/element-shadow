const path = require('path');
const webpack = require('webpack');
// 为每个包含 CSS 的 JS 文件创建一个独立的 CSS 文件，支持按需加载和 SourceMaps
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 将已存在的文件或者目录拷贝到 build 目录
const CopyWebpackPlugin = require('copy-webpack-plugin');
/**
 * 简化 HTML 文件的创建，主要作用：
 *  1. 根据模板生成 HTML 文件
 *  2. 给生成的 HTML 文件引入外部资源，比如 link、script 等
 *  3. 改变每次引入的外部文件的 Hash，防止 HTML 引用缓存中的过时资源
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
// 优化压缩CSS资源
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
// 用于Js文件优化压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = require('./config');

const isProd = process.env.NODE_ENV === 'production';
const isPlay = !!process.env.PLAY_ENV;

const webpackConfig = {
  /**
   * 许多 library 将通过与 process.env.NODE_ENV 环境变量关联，以决定 library 中应该引用哪些内容。
   *
   * 例如：
   * 当不处于生产环境中时，某些 library 为了使调试变得容易，可能会添加额外的日志记录(log)和测试(test)。
   * 当使用 process.env.NODE_ENV === 'production' 时，一些 library 可能针对具体用户的环境进行代码优化，从而删除或添加一些重要代码。
   */
  mode: process.env.NODE_ENV, // process.env 为 node.js 中包含用户环境的对象
  /**
   * 根据不同的执行条件选择不同的程序入口
   * 单页应用(SPA)：一个入口起点；多页应用(MPA)：多个入口起点
   */
  entry: isProd
    ? { docs: './examples/entry.js', 'element-ui': './src/index.js' }
    : (isPlay ? './examples/play.js' : './examples/entry.js'),
  output: {
    path: path.resolve(process.cwd(), './examples/element-ui/'),
    /**
     * output.publicPath：静态资源的公共路径
     *
     * 静态资源最终访问路径 = output.publicPath + 资源 loader 或插件等配置路径，例如：
     * publicPath 配置为 /dist/，图片 url-loader 配置项为 name: 'img/[name].[ext]'，
     * 那么最终打包出来文件中图片的引用路径为 output.publicPath + 'img/[name].[ext]' = '/dist/img/[name].[ext]'
     */
    publicPath: process.env.CI_ENV || '',
    /**
     * output.filename：文件的输出名称
     * [name]表示根据入口文件的名称，打包成相同的名称，有几个入口就可以打包出几个文件
     */
    filename: '[name].[hash:7].js',
    chunkFilename: isProd ? '[name].[hash:7].js' : '[name].js' // 打包后的代码块名称
  },
  /**
   * resolve: 设置模块如何被解析
   * resolve.modules：告诉 webpack 解析模块时应搜索的目录
   * resolve.alias：创建 import 或 require 的别名，来确保模块引入变得更简单
   */
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: config.alias,
    modules: ['node_modules']
  },
  /**
   * devServer：用于快速开发应用程序，提供一个简单的 web server，并且具有 live reloading（实时重新加载） 功能
   *
   * 以下配置的含义：将 / 目录下的文件 server 到 0.0.0.0:8086 下
   */
  devServer: {
    host: '0.0.0.0',
    port: 8086,
    publicPath: '/',
    hot: true // 实时重新加载
  },
  /**
   * performance：配置如何展示性能提示
   * performance.hints：打开/关闭提示(false | "error" | "warning")，开发环境下推荐值为"warning"
   */
  performance: {
    hints: false
  },
  /**
   * stats：有一些预设选项，可作为快捷方式
   */
  stats: {
    children: false
  },
  /**
   * module：用于决定如何处理项目中不同类型的模块
   */
  module: {
    // 创建模块时，匹配请求的规则数组，这些规则能够修改模块的创建方式
    rules: [
      {
        enforce: 'pre', // 指定规则的种类("pre" | "post")
        test: /\.(vue|jsx?)$/, // 标识适用规则的文件类型，Rule.resource.test 的缩写，与 Rule.resource 互斥使用
        exclude: /node_modules/, // 标识规则不适用的范围，Rule.resource.exclude 的缩写，与 Rule.resource 互斥使用
        loader: 'eslint-loader' // 对模块使用的 loader，类似的还有 parser
      },
      {
        test: /\.(jsx?|babel|es6)$/,
        include: process.cwd(),
        exclude: config.jsexclude,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.(scss|css)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                preserveWhitespace: false
              }
            }
          },
          {
            loader: path.resolve(__dirname, './md-loader/index.js')
          }
        ]
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|gif|png|jpe?g)(\?\S*)?$/,
        loader: 'url-loader',
        // todo: 这种写法有待调整
        query: { // Rule.use:[{options}] 的简写
          limit: 10000,
          name: path.posix.join('static', '[name].[hash:7].[ext]')
        }
      }
    ]
  },
  /**
   * 用于以各种方式自定义 webpack 构建过程。webpack 附带了各种内置插件，可以通过 webpack.[plugin-name] 访问这些插件。
   */
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 热部署
    /**
     * html模板所在的文件路径
     * 根据自己的指定的模板文件来生成特定的 html 文件.
     * 这里的模板类型可以是任意你喜欢的模板，可以是 html, jade, ejs, hbs, 等等.
     * 使用自定义的模板文件时，需要提前安装对应的 loader， 否则webpack不能正确解析.
     * 如果你设置的 title 和 filename 于模板中发生了冲突，那么以你的 title 和 filename 的配置值为准.
     */
    new HtmlWebpackPlugin({
      /**
       * template：要打包输出的模板路径，可以是相对路径或绝对路径
       */
      template: './examples/index.tpl', // *.tpl：表示文件为模板文件，是自定义的一种文件格式，功能上等同 HTML
      filename: './index.html', // 定义打包输出后的 HTML 文件名称
      favicon: './examples/favicon.ico'
      /**
       * chunks 配置补充说明 - chunks: ['manifest', 'vendor', 'entry']
       *
       * 如果没有配置 chunks 那么生成的 HTML 会引入所有入口 JS 文件，所以要使用 chunks 配置来指定生成的
       * HTML 文件应该引入哪个 JS 文件
       *
       * - vendor 指提取涉及 node_modules 中的公共模块
       * - manifest 是对 vendor 模块做缓存
       */
    }),
    new CopyWebpackPlugin([
      { from: 'examples/versions.json' }
    ]),
    new ProgressBarPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env.FAAS_ENV': JSON.stringify(process.env.FAAS_ENV)
    }),
    new webpack.LoaderOptionsPlugin({
      vue: {
        compilerOptions: {
          preserveWhitespace: false
        }
      }
    })
  ],
  optimization: {
    minimizer: []
  },
  devtool: '#eval-source-map'
};

/**
 * 打包生产代码时(根据 isProd 判断)，启用对资源的压缩优化
 */
if (isProd) {
  webpackConfig.externals = {
    vue: 'Vue',
    'vue-router': 'VueRouter',
    'highlight.js': 'hljs'
  };
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:7].css'
    })
  );
  webpackConfig.optimization.minimizer.push(
    // 对 Js 文件进行压缩
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: false
    }),
    // 优化或者压缩 CSS 资源
    new OptimizeCSSAssetsPlugin({})
  );
  webpackConfig.devtool = false;
}

module.exports = webpackConfig;

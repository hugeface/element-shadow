/**
 * webpack 的部分配置（较复杂的），在 webpack.[type_name].js 中被使用
 */
var path = require('path'); // path 模块用于处理文件路径(NodeJs)
var fs = require('fs'); // 以模仿标准 POSIX 函数的方式与文件系统进行交互(NodeJs)
var nodeExternals = require('webpack-node-externals');
var Components = require('../components.json');

var utilsList = fs.readdirSync(path.resolve(__dirname, '../src/utils'));
var mixinsList = fs.readdirSync(path.resolve(__dirname, '../src/mixins'));
var transitionList = fs.readdirSync(path.resolve(__dirname, '../src/transitions'));
var externals = {};

Object.keys(Components).forEach(function(key) {
  externals[`element-ui/packages/${key}`] = `element-ui/lib/${key}`;
});

externals['element-ui/src/locale'] = 'element-ui/lib/locale';
utilsList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/utils/${file}`] = `element-ui/lib/utils/${file}`;
});
mixinsList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/mixins/${file}`] = `element-ui/lib/mixins/${file}`;
});
transitionList.forEach(function(file) {
  file = path.basename(file, '.js');
  externals[`element-ui/src/transitions/${file}`] = `element-ui/lib/transitions/${file}`;
});

externals = [Object.assign({
  vue: 'vue'
}, externals), nodeExternals()];

exports.externals = externals;

// 以下模块适应频率较高，配置模块别名来简化模块引用
exports.alias = {
  main: path.resolve(__dirname, '../src'), // 为工程根目录下的 src 模块设置别名"main"
  packages: path.resolve(__dirname, '../packages'), // 为工程根目录下的 packages 模块设置别名"packages"
  examples: path.resolve(__dirname, '../examples'), // 为工程根目录下的 examples 模块设置别名"examples"
  'element-ui': path.resolve(__dirname, '../') // 为工程根目录设置别名"element-ui"
};

exports.vue = {
  root: 'Vue',
  commonjs: 'vue',
  commonjs2: 'vue',
  amd: 'vue'
};

exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date\.js/;

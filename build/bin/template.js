const path = require('path');
/**
 * path.resolev()：将路径或路径序列解析为绝对路径。如果没有传入 path 片段，则 path.resolve() 将返回当前工作目录的绝对路径。
 * path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
 * 如果当前工作目录是 /home/myself/node，
 * 则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'
 **/
const templates = path.resolve(process.cwd(), './examples/pages/template');

const chokidar = require('chokidar'); // chokidar：监听文件变化的插件
let watcher = chokidar.watch([templates]);

watcher.on('ready', function() {
  watcher
    .on('change', function() {
      exec('npm run i18n'); // 若模板文件发生变化，则执行 i18n
    });
});

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}

/**
 * 开发模式下的工程入口，见配置文件 webpack.demo.js
 */
import Vue from 'vue';
import entry from './app';
import VueRouter from 'vue-router';
import Element from 'main/index.js'; // Element 全部组件的注册入口
import hljs from 'highlight.js';
import routes from './route.config';
import demoBlock from './components/demo-block';
import MainFooter from './components/footer';
import MainHeader from './components/header';
import SideNav from './components/side-nav';
import FooterNav from './components/footer-nav';
import title from './i18n/title';

import 'packages/theme-chalk/src/index.scss';
import './demo-styles/index.scss';
import './assets/styles/common.css';
import './assets/styles/fonts/style.css';
import icon from './icon.json';

/**
 * Vue.use()
 * 安装 Vue.js 插件。
 * 如果插件是一个对象，必须提供 install 方法；如果插件是一个函数，它会被作为 install 方法。
 * install 方法调用时，会将 Vue 作为参数传入，该方法需在调用 new Vue() 之前被调用。
 * 当 install 方法被同一个插件多次调用，插件将只会被安装一次。
 */
Vue.use(Element);
Vue.use(VueRouter);
/**
 * Vue.component()
 * 注册或获取全局组件。注册还会自动使用给定的 id 设置组件的名称。
 */
Vue.component('demo-block', demoBlock);
Vue.component('main-footer', MainFooter);
Vue.component('main-header', MainHeader);
Vue.component('side-nav', SideNav);
Vue.component('footer-nav', FooterNav);

const globalEle = new Vue({
  data: { $isEle: false } // 是否 ele 用户
});

/**
 * 在 Vue.mixin() 之前被创建的 Vue 组件 globalEle 不含 $isEle 属性
 * 在 Vue.mixin() 之后被创建的 Vue 组件都含有 $isEle 属性
 */
Vue.mixin({
  computed: {
    $isEle: {
      /**
       * 计算属性的 setter 和 getter：
       * 当计算属性依赖的其他属性值发生改变将触发 setter 的执行，随后触发 getter，最后生命钩子 updated() 方法也会执行。
       */
      get: () => (globalEle.$data.$isEle),
      set: (data) => {globalEle.$data.$isEle = data;}
    }
  }
});

Vue.prototype.$icon = icon; // Icon 列表页用

/**
 * Router 构建选项
 *
 * mode - 路由配置模式，可选值为 "hash" | "history" | "abstract"
 *    hash：浏览器环境，使用 URL hash 值来作路由
 *    history：依赖 HTML5 History API 和服务器配置
 *    abstract：Node.js 服务器端，支持所有 JavaScript 运行环境
 *              如果发现没有浏览器的 API，路由会自动强制进入 abstract 模式
 * base - 应用的基路径
 * routes - 路由记录
 */
const router = new VueRouter({
  mode: 'hash',
  base: __dirname, // 总是指向被执行 js 文件的绝对路径
  routes
});

router.afterEach(route => {
  // https://github.com/highlightjs/highlight.js/issues/909#issuecomment-131686186
  Vue.nextTick(() => {
    const blocks = document.querySelectorAll('pre code:not(.hljs)');
    Array.prototype.forEach.call(blocks, hljs.highlightBlock); // ???
  });
  const data = title[route.meta.lang];
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  document.title = 'Element'; // 设置页面名称
  ga('send', 'event', 'PageView', route.name);
});

new Vue({ // eslint-disable-line
  ...entry,
  router
}).$mount('#app');

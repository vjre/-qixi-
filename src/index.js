/* eslint-disable camelcase */
/* eslint-disable no-undef */

import { createApp } from 'vue';
import { createRouter, createWebHashHistory, RouterView } from 'vue-router';

import {
  pageComponentMap,
  pageDescriptors,
} from './routes';

const app = createApp(RouterView);

// 无极平台的调试插件，仅在调试模式下生效
if (typeof __wuji_gogo_plugin !== 'undefined') {
  app.use(__wuji_gogo_plugin);
}

// 创建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes:
    pageDescriptors.map((p) => ({
      path: p.routePath,
      component: pageComponentMap[p.file],
    })),
});

app
  .use(router)
  .mount('#app');

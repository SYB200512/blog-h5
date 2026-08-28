import { ViteSSG } from 'vite-ssg'
import ElementPlus, { ID_INJECTION_KEY } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import { routes } from './router'
import './assets/main.css'

// 导出 createApp 供 vite-ssg 在客户端与 SSR 构建时使用
export const createApp = ViteSSG(App, { routes }, ({ app }) => {
  // Element Plus
  app.use(ElementPlus, { locale: zhCn })

  // SSR 水合需要一致的 id provider（Element Plus 组件内部依赖）
  app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })

  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
})

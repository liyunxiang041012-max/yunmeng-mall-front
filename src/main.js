import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'

const themes = {
  '/my': {
    '--bg':      '#FAFAF8',
    '--bg2':     '#F5F2EC',
    '--bg3':     '#EDE8DC',
    '--border':  '#E0D8C8',
    '--text':    '#1A1A18',
    '--text2':   '#4A4438',
    '--text3':   '#8A8070',
    '--gold':    '#A07830',
    '--gold-hi': '#C9A84C',
    'bodyBg':    '#F5F2EC',
  },
  '/home': {
    '--bg':      '#1C1608',
    '--bg2':     '#2C2410',
    '--bg3':     '#322A14',
    '--border':  '#4A3E1E',
    '--text':    '#F5ECD0',
    '--text2':   '#D4C48A',
    '--text3':   '#8A7A50',
    '--gold':    '#C9A84C',
    '--gold-hi': '#F0C060',
    'bodyBg':    '#1C1608',
  }
}

function applyTheme(path) {
  const theme = themes[path] || themes['/home']
  Object.entries(theme).forEach(([key, val]) => {
    if (key === 'bodyBg') {
      document.body.style.background = val
    } else {
      document.documentElement.style.setProperty(key, val)
    }
  })
}

// 立即应用当前路径的主题（解决首次加载闪屏）
applyTheme(window.location.pathname)

// 每次路由跳转都切换主题
router.afterEach((to) => applyTheme(to.path))

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 不需要全局导航栏的页面（登录/注册/商家后台）
const hideNavPaths = ['/login', '/register', '/shop/register']
const showNav = computed(() => {
  // meta 标记优先
  if (route.meta.hideGlobalNav) return false
  // 登录/注册页也不显示
  return !hideNavPaths.includes(route.path)
})

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home')
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('isLogin')
  localStorage.removeItem('userName')
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <!-- ══ 全局导航栏（登录/注册页不显示） ══ -->
    <nav v-if="showNav" class="global-nav">
      <div class="gn-left">
        <button class="gn-btn" @click="goBack" title="返回上一页">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
        <button class="gn-btn" @click="goHome" title="回到首页">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          首页
        </button>
      </div>
      <div class="gn-right">
        <button class="gn-btn gn-logout" @click="logout" title="退出登录">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          退出
        </button>
      </div>
    </nav>

    <router-view />
  </div>
</template>


<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ═══════════════ 全局导航栏 ═══════════════ */
.global-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #E0D8C8;
}
.gn-left, .gn-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.gn-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: #5C5546;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
}
.gn-btn:hover {
  background: #F5F1E8;
  color: #1A1712;
}
.gn-logout:hover {
  color: #C0392B;
  background: rgba(192,57,43,0.06);
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(201,168,76,0.3);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(201,168,76,0.5);
}

/* 全局选中色 */
::selection {
  background: rgba(201,168,76,0.2);
  color: #1A1A18;
}
</style>
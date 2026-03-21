<script setup>
// 导入路由并使用
import { useRouter } from 'vue-router'

// 初始化路由实例（如果需要在根组件中使用路由相关功能）
const router = useRouter()
</script>

<template>
  <!-- 路由视图容器，确保登录页面能占满整个视口 -->
  <div class="app-container">
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
</style>
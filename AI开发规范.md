# AI 前端开发规范（精简版）

## API 规范

```javascript
// 统一导入
import request from '../utils/request'

// GET 请求
export const getXxx = (id) => request.get(`/路径/${id}`)

// POST 请求
export const createXxx = (data) => request.post('/路径', data)

// 文件上传
export const uploadXxx = (formData) => request.post('/路径', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

// PUT 请求
export const updateXxx = (id, data) => request.put(`/路径/${id}`, data)

// DELETE 请求
export const deleteXxx = (id) => request.delete(`/路径/${id}`)
```

## Vue 组件模板

```vue
<template>
  <img :src="url" @error="handleImageError" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiFunction } from '@/api/xxx'
import nofoundImage from '@/assets/images/nofound.png'

// 图片错误处理
const handleImageError = (e) => {
  e.target.src = nofoundImage
}

// 异步操作
const handleXxx = async () => {
  try {
    const res = await apiFunction()
    const data = res.data || res  // 解包 Result<T>
  } catch (err) {
    ElMessage.error(err.response?.data?.message || '操作失败')
  }
}

// 删除确认
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteXxx(id)
    ElMessage.success('删除成功')
  } catch {}
}
</script>
```

## 核心规则

1. **返回值处理**: `res.data || res`
2. **图片必加**: `@error="handleImageError"`
3. **数组判断**: `Array.isArray(res.data) ? res.data : []`
4. **防重复点击**: 使用 `loading` 状态
5. **支付安全**: URL 只传 orderId，不传敏感数据
6. **表单验证**: 必填字段用 `trim()` + 长度检查
7. **路由守卫**: 需登录页面加 `meta: { requireAuth: true }`
8. **并行请求**: 使用 `Promise.all` 并行获取多个接口数据
9. **空值处理**: 使用 `??` 代替 `||` 处理可能为 0 的数值
10. **后端容错**: 后端接口可能不返回 data,用 `res.data || {}` 和明细接口计算兜底
每次写完要是有要优化的地方要来优化开发规范更新时间每次写在最后一行
尽量使用rtk进行命令压缩
**更新时间**: 2026-05-25 16:00
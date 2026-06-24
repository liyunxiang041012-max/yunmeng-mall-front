import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
})

// 请求拦截器，自动带token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

// 响应拦截器 → 统一处理业务错误（硬编码提示）
request.interceptors.response.use(
  res => {
    const body = res.data
    // 业务错误（code 非 200 且非 0），后端统一返回 { code, message/msg }
    if (body && typeof body.code === 'number' && body.code !== 200 && body.code !== 0) {
      // 直接用后端返回的 message，没有就硬编码
      const msg = body.message || body.msg || '操作失败，请稍后重试'
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    }
    // 成功：直接返回 data 字段
    return body.data
  },
  err => {
    // 401 跳登录（区分管理员端和用户端）
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      const isAdmin = window.location.pathname.startsWith('/admin')
      router.push(isAdmin ? '/admin' : '/login')
      ElMessage.error('登录已过期，请重新登录')
      return Promise.reject(err)
    }
    // 其他所有错误 → 优先用后端返回的 message
    const backendMsg = err.response?.data?.message || err.response?.data?.msg
    const msg = backendMsg || '网络异常，请稍后重试'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  }
)

export default request
import axios from 'axios'
import { ElMessage } from 'element-plus'

// SSR（预渲染）阶段使用绝对地址直连后端，客户端走 Vite 代理
// SSG 构建时通过环境变量 SSG_API_BASE 指向后端（容器内为 http://backend:8080/api/v1）
const ssrBase =
  typeof process !== 'undefined' && process.env ? process.env.SSG_API_BASE : undefined
const baseURL = import.meta.env.SSR
  ? ssrBase || 'http://localhost:8080/api/v1'
  : '/api/v1'

// 创建 axios 实例
const request = axios.create({
  baseURL,
  timeout: 10000,
})

// 请求拦截器：附加 token（SSR 阶段无 localStorage）
request.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理业务码
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 非 JSON 响应直接返回
    if (res.code === undefined) return res
    if (res.code === 0) return res.data
    // 未认证：跳转登录（SSR 阶段不跳转）
    if (res.code === 4001 && !import.meta.env.SSR) {
      localStorage.removeItem('token')
      window.location.href = '/admin/login'
    }
    if (!import.meta.env.SSR) {
      ElMessage.error(res.message || '请求失败')
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '网络错误'
    // SSR 阶段不弹窗
    if (!import.meta.env.SSR) {
      ElMessage.error(msg)
    }
    return Promise.reject(error)
  }
)

export default request
